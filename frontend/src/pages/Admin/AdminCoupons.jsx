import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';

const AdminCoupons = ({ user, navigate, onLogout }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // State lưu thông tin form tạo mã mới
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscountAmount: 0,
    minPurchaseAmount: 0,
    expirationDate: '',
    usageLimit: 100
  });

  // Lấy danh sách mã giảm giá từ Backend
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/coupons');
      setCoupons(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải danh sách coupon:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (!user.isAdmin && !user.role)) {
      navigate('/login');
      return;
    }
    fetchCoupons();
  }, [user, navigate]);

  // Xử lý tạo mã mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/coupons', form);
      alert('Tạo mã giảm giá thành công!');
      setShowModal(false);
      
      // Reset form
      setForm({ code: '', discountType: 'percentage', discountValue: 0, maxDiscountAmount: 0, minPurchaseAmount: 0, expirationDate: '', usageLimit: 100 });
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi tạo mã giảm giá');
    }
  };

  // Xử lý xóa mã
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn vô hiệu hóa/xóa mã giảm giá này?')) {
      try {
        await api.delete(`/api/coupons/${id}`);
        alert('Đã xóa mã giảm giá!');
        fetchCoupons();
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi xóa mã');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f5f7fa' }}>
      
      {/* SIDEBAR */}
      <AdminSidebar activePath={window.location.pathname} navigate={navigate} onLogout={onLogout} />

      {/* NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>Quản lý Mã giảm giá</h1>
          <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            + Tạo mã Coupon mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Đang tải dữ liệu mã giảm giá...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Mã Code</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Mức giảm</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Đơn tối thiểu</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Đã dùng / Giới hạn</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Hạn sử dụng</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Chưa có mã giảm giá nào trên hệ thống.</td>
                  </tr>
                ) : (
                  coupons.map(c => {
                    const isExpired = new Date(c.expirationDate) < new Date();
                    return (
                      <tr key={c._id} style={{ borderBottom: '1px solid #eee', background: isExpired || !c.isActive ? '#fafafa' : '#fff' }}>
                        <td style={{ padding: '15px 20px', fontWeight: 800, color: isExpired || !c.isActive ? '#999' : '#1565C0', fontSize: 15, letterSpacing: 1 }}>
                          {c.code}
                        </td>
                        <td style={{ padding: '15px 20px', fontWeight: 600, color: '#111' }}>
                          {c.discountType === 'percentage' ? `${c.discountValue}% (Tối đa ${c.maxDiscountAmount.toLocaleString()}đ)` : `${c.discountValue.toLocaleString()}đ`}
                        </td>
                        <td style={{ padding: '15px 20px', color: '#555' }}>{c.minPurchaseAmount?.toLocaleString()}đ</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ fontWeight: 700, color: c.usageCount >= c.usageLimit ? '#d32f2f' : '#2e7d32' }}>{c.usageCount}</span> / {c.usageLimit}
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: 13 }}>
                          <span style={{ color: isExpired ? '#d32f2f' : '#555', fontWeight: isExpired ? 700 : 400 }}>
                            {new Date(c.expirationDate).toLocaleDateString('vi-VN')} {isExpired && '(Đã hết hạn)'}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                          <button onClick={() => handleDelete(c._id)} style={{ padding: '6px 12px', fontSize: 12, background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TẠO MÃ MỚI */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '550px', borderRadius: 12, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Tạo mã giảm giá mới</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Mã Code (VD: SUMMER20) *</label>
                  <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box', textTransform: 'uppercase' }} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Loại giảm giá</label>
                  <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}>
                    <option value="percentage">Theo phần trăm (%)</option>
                    <option value="fixed">Tiền mặt (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Giá trị giảm *</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: Number(e.target.value)})} placeholder={form.discountType === 'percentage' ? "VD: 10" : "VD: 50000"} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} required />
                </div>
                {form.discountType === 'percentage' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Giảm tối đa (VNĐ)</label>
                    <input type="number" value={form.maxDiscountAmount} onChange={e => setForm({...form, maxDiscountAmount: Number(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Đơn hàng tối thiểu (VNĐ)</label>
                  <input type="number" value={form.minPurchaseAmount} onChange={e => setForm({...form, minPurchaseAmount: Number(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Giới hạn lượt dùng</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: Number(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Ngày hết hạn *</label>
                <input type="date" value={form.expirationDate} onChange={e => setForm({...form, expirationDate: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '10px 25px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Phát hành mã</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;