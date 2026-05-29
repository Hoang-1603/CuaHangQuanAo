import React, { useState, useEffect } from 'react';
import api from '../api/api';


const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='75' viewBox='0 0 60 75'%3E%3Crect width='60' height='75' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-size='10'%3EIMG%3C/text%3E%3C/svg%3E";

const CheckoutPage = ({ cartItems = [], totalPrice = 0, navigate, removeFromCart, updateQty, clearCart, user }) => {
  // Đọc địa chỉ đã lưu từ user.addresses
  const getAddr = (label) => user?.addresses?.find(a => a.label === label)?.value || '';

  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: getAddr('address'),
    tinh:    getAddr('city'),
    huyen:   getAddr('district'),
    phuong:  getAddr('ward'),
    note:    '',
  });
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const afterDiscount = Math.max(0, totalPrice - discount);
  const shipping = afterDiscount >= 500000 ? 0 : 30000;
  const finalTotal = afterDiscount + shipping;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) { setCouponError('Vui lòng nhập mã giảm giá'); return; }
    setCouponLoading(true); setCouponError(''); setCouponMessage('');
    try {
      const { data } = await api.post('/api/coupons/validate', { code: coupon.trim(), cartTotal: totalPrice });
      setDiscount(data.discountAmount); setCouponApplied(true);
      setCouponMessage(`✓ ${data.message} (-${data.discountAmount.toLocaleString()}đ)`);
    } catch (err) {
      setCouponApplied(false); setDiscount(0);
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => {
    setCoupon(''); setCouponApplied(false); setDiscount(0); setCouponMessage(''); setCouponError('');
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ và tên';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
    if (!form.tinh) e.tinh = 'Vui lòng chọn tỉnh/thành';
    if (!form.huyen) e.huyen = 'Vui lòng chọn quận/huyện';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    try {
      setLoading(true);
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.product.name,
          quantity: item.qty,
          image: item.product.images?.[0] || item.product.image || item.product.img,
          price: item.product.price,
          size: item.size,
          color: item.color,
          product: item.product._id || item.product.id,
        })),
        couponCode: couponApplied ? coupon.trim().toUpperCase() : null,
        shippingAddress: {
          address: form.address, city: form.tinh, district: form.huyen,
          ward: form.phuong, phone: form.phone, name: form.name
        },
        paymentMethod: 'COD',
        itemsPrice: totalPrice, shippingPrice: shipping, discountPrice: discount,
        totalPrice: finalTotal, note: form.note
      };
      await api.post('/api/orders', orderData);
      if (clearCart) clearCart();
      setSubmitted(true); setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đặt hàng');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0 && !submitted) navigate('/');
  }, [cartItems, submitted, navigate]);

  const inputStyle = (field) => ({ width: '100%', padding: '12px 14px', border: '1px solid ' + (errors[field] ? '#e53935' : '#ddd'), fontSize: 13, outline: 'none', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit', color: '#222' });

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 5%' }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Đặt hàng thành công!</h2>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Cảm ơn bạn đã mua hàng tại <strong>Binh Minh Store</strong>.</p>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 32 }}>Chúng tôi sẽ XÁC NHẬN đơn hàng bằng TIN NHẮN SMS hoặc GỌI ĐIỆN.</p>
        <button onClick={() => navigate('/')} style={{ padding: '14px 40px', background: '#000', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: 1 }}>TIẾP TỤC MUA HÀNG</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '80vh' }}>
      <style>{`.ck-input:focus { border-color: #000 !important; } .ck-err { color: #e53935; font-size: 11px; margin-top: 4px; } .ck-cart-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; align-items: center; } .ck-qty-btn { width: 26px; height: 26px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; } .ck-qty-btn:hover { background: #f5f5f5; }`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 5% 80px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60, alignItems: 'start' }}>
        
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#888', marginBottom: 28 }}>
            <span style={{ cursor: 'pointer', color: '#555' }} onClick={() => navigate('/')}>Giỏ hàng</span>
            <span>›</span>
            <span style={{ color: '#111', fontWeight: 600 }}>Thanh toán</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: '#111' }}>Thông tin giao hàng</h2>

          <div style={{ marginBottom: 14 }}>
            <input className="ck-input" placeholder="Họ và tên *" value={form.name} onChange={e => { set('name', e.target.value); setErrors(er => ({ ...er, name: '' })); }} style={inputStyle('name')} />
            {errors.name && <p className="ck-err">{errors.name}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <input className="ck-input" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle('')} />
            <div>
              <input className="ck-input" placeholder="Số điện thoại *" value={form.phone} onChange={e => { set('phone', e.target.value); setErrors(er => ({ ...er, phone: '' })); }} style={inputStyle('phone')} />
              {errors.phone && <p className="ck-err">{errors.phone}</p>}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <input className="ck-input" placeholder="Địa chỉ (số nhà, tên đường) *" value={form.address} onChange={e => { set('address', e.target.value); setErrors(er => ({ ...er, address: '' })); }} style={inputStyle('address')} />
            {errors.address && <p className="ck-err">{errors.address}</p>}
          </div>

          {/* Tỉnh / Huyện */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <input className="ck-input" placeholder="Tỉnh / Thành phố *" value={form.tinh} onChange={e => { set('tinh', e.target.value); setErrors(er => ({ ...er, tinh: '' })); }} style={inputStyle('tinh')} />
              {errors.tinh && <p className="ck-err">{errors.tinh}</p>}
            </div>
            <div>
              <input className="ck-input" placeholder="Quận / Huyện *" value={form.huyen} onChange={e => { set('huyen', e.target.value); setErrors(er => ({ ...er, huyen: '' })); }} style={inputStyle('huyen')} />
              {errors.huyen && <p className="ck-err">{errors.huyen}</p>}
            </div>
          </div>

          {/* Phường / Xã */}
          <div style={{ marginBottom: 20 }}>
            <input className="ck-input" placeholder="Phường / Xã" value={form.phuong} onChange={e => set('phuong', e.target.value)} style={inputStyle('')} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <textarea className="ck-input" placeholder="Ghi chú (tùy chọn)" value={form.note} onChange={e => set('note', e.target.value)} rows={3} style={{ ...inputStyle(''), resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#111' }}>Phương thức thanh toán</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px solid #000', borderRadius: 4, cursor: 'pointer', marginBottom: 28 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</span>
          </label>

          <div style={{ background: '#fffbf0', border: '1px solid #ffe082', borderRadius: 4, padding: '14px 16px', fontSize: 12, color: '#7a6000', lineHeight: 1.7, marginBottom: 28 }}>
            Chúng tôi sẽ <strong>XÁC NHẬN</strong> đơn hàng bằng <strong>TIN NHẮN SMS</strong> hoặc <strong>GỌI ĐIỆN</strong>. Vui lòng kiểm tra TIN NHẮN hoặc NGHE MÁY ngay khi đặt hàng thành công và <strong>CHỜ NHẬN HÀNG</strong>.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 12, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/')}>‹ Tiếp tục mua sắm</span>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '16px', background: loading ? '#888' : '#1565C0', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 4, letterSpacing: 0.5 }}>
              {loading ? 'Đang xử lý...' : 'Hoàn tất đơn hàng'}
            </button>
          </div>
        </div>

        <div style={{ background: '#fafafa', borderRadius: 8, border: '1px solid #eee', padding: 28, position: 'sticky', top: 120 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, color: '#111', letterSpacing: 0.3 }}>ĐƠN HÀNG CỦA BẠN</h3>
          <div style={{ marginBottom: 20 }}>
            {cartItems.map(item => {
              const price = item.product.price || 0;
              return (
                <div key={item.key} className="ck-cart-item">
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={item.product.images?.[0] || item.product.image || item.product.img} alt={item.product.name} style={{ width: 60, height: 75, objectFit: 'cover', background: '#f0f0f0', display: 'block' }} onError={e => e.target.src = PLACEHOLDER_IMG} />
                    <span style={{ position: 'absolute', top: -8, right: -8, background: '#555', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.qty}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 3px', color: '#222', lineHeight: 1.4 }}>{item.product.name}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>{item.color} · {item.size}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button className="ck-qty-btn" onClick={() => updateQty && updateQty(item.key, -1)}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button className="ck-qty-btn" onClick={() => updateQty && updateQty(item.key, 1)}>+</button>
                      <button onClick={() => removeFromCart && removeFromCart(item.key)} style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#bbb', padding: '0 4px' }} title="Xóa">🗑</button>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>{(price * item.qty).toLocaleString()}đ</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginBottom: 20 }}>
            {!couponApplied ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Mã giảm giá" value={coupon} onChange={e => { setCoupon(e.target.value); setCouponError(''); }} onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} disabled={couponLoading} style={{ flex: 1, padding: '10px 12px', border: '1px solid ' + (couponError ? '#e53935' : '#ddd'), fontSize: 12, outline: 'none', borderRadius: 4 }} />
                <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 16px', background: couponLoading ? '#888' : '#1565C0', color: '#fff', border: 'none', fontWeight: 700, cursor: couponLoading ? 'not-allowed' : 'pointer', fontSize: 12, borderRadius: 4, whiteSpace: 'nowrap' }}>{couponLoading ? '...' : 'Sử dụng'}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f0faf4', border: '1px solid #a5d6a7', borderRadius: 4 }}>
                <span style={{ flex: 1, fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>{couponMessage}</span>
                <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888', padding: '0 4px', lineHeight: 1 }} title="Xóa mã">×</button>
              </div>
            )}
            {couponError && <p style={{ fontSize: 11, color: '#e53935', marginTop: 6 }}>{couponError}</p>}
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 8 }}><span>Tạm tính</span><span>{totalPrice.toLocaleString()}đ</span></div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2e7d32', marginBottom: 8 }}><span>Giảm giá</span><span>-{discount.toLocaleString()}đ</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 16 }}><span>Phí vận chuyển</span><span style={{ color: shipping === 0 ? '#2e7d32' : '#000' }}>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()}đ`}</span></div>
            {shipping > 0 && <p style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>Miễn phí vận chuyển cho đơn từ 500.000đ</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111', paddingTop: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Tổng cộng</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#888', marginRight: 6 }}>VND</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#000' }}>{finalTotal.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;