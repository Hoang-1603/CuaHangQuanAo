import React, { useState, useEffect } from 'react';
import api from '../api/api';

const STATUS_COLORS = {
  'Chờ xác nhận': { color: '#d97706', bg: '#fef3c7' },
  'Đang xử lý':   { color: '#6a1b9a', bg: '#f3e5f5' },
  'Đang giao':    { color: '#1565C0', bg: '#e3f2fd' },
  'Đã giao':      { color: '#2e7d32', bg: '#e8f5e9' },
  'Đã hủy':       { color: '#c62828', bg: '#ffebee' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { color: '#555', bg: '#f5f5f5' };
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
    <span style={{ color: '#888', flexShrink: 0, minWidth: 100 }}>{label}:</span>
    <span style={{ color: '#222' }}>{value}</span>
  </div>
);

// ——— CHI TIẾT ĐƠN HÀNG ———
const OrderDetail = ({ order, onBack, onCancel }) => {
  const [confirmCancel, setConfirmCancel] = useState(false);
  // Dùng đúng field orderStatus từ DB
  const canCancel = order.orderStatus === 'Chờ xác nhận';

  return (
    <div style={{ animation: 'fadeIn .25s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888', marginBottom: 24 }}>
        <span style={{ cursor: 'pointer', color: '#1565C0' }} onClick={onBack}>← Đơn hàng</span>
        <span>/</span>
        <span style={{ color: '#111', fontWeight: 600 }}>#{order._id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>Thông tin đơn hàng</h4>
          <Row label="Mã đơn"    value={'#' + order._id} />
          <Row label="Ngày đặt"  value={new Date(order.createdAt).toLocaleDateString('vi-VN')} />
          <Row label="Trạng thái" value={<StatusBadge status={order.orderStatus} />} />
          <Row label="Tổng tiền" value={<strong>{order.totalPrice?.toLocaleString()}đ</strong>} />
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>Thông tin giao hàng</h4>
          <Row label="Người nhận" value={order.shippingAddress?.name || '—'} />
          <Row label="SĐT"        value={order.shippingAddress?.phone || '—'} />
          <Row label="Địa chỉ"   value={order.shippingAddress?.address || '—'} />
          <Row label="Thanh toán" value={order.paymentMethod || 'COD (Khi nhận hàng)'} />
        </div>
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: 6, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: '#f9f9f9', padding: '12px 20px', borderBottom: '1px solid #eee' }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Sản phẩm ({order.orderItems?.length || 0})
          </h4>
        </div>
        {(order.orderItems || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < order.orderItems.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            {/* Ưu tiên: ảnh đã lưu trong orderItem, fallback sang populated product */}
            <img
              src={item.image || item.product?.images?.[0] || '/images/default.jpg'}
              alt={item.name}
              style={{ width: 60, height: 75, objectFit: 'cover', borderRadius: 4, background: '#f5f5f5' }}
              onError={e => e.target.src = 'https://via.placeholder.com/60x75?text=IMG'}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px', color: '#222' }}>{item.name}</p>
              {/* Dùng item.quantity (field từ DB), không phải item.qty */}
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                Màu: {item.color} · Size: {item.size} · SL: {item.quantity}
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>
              {(item.price * item.quantity).toLocaleString()}đ
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px', borderTop: '2px solid #eee', background: '#fafafa' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#000', margin: 0 }}>
              Tổng: {order.totalPrice?.toLocaleString()}đ
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{ padding: '10px 24px', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', fontSize: 13, fontWeight: 600, borderRadius: 2 }}>
          ← Quay lại
        </button>
        {canCancel && !confirmCancel && (
          <button onClick={() => setConfirmCancel(true)} style={{ padding: '10px 24px', background: '#fff', border: '1px solid #e53935', color: '#e53935', cursor: 'pointer', fontSize: 13, fontWeight: 600, borderRadius: 2 }}>
            Hủy đơn hàng
          </button>
        )}
        {canCancel && confirmCancel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Xác nhận hủy đơn?</span>
            <button onClick={() => { onCancel(order._id); setConfirmCancel(false); }} style={{ padding: '8px 20px', background: '#e53935', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, borderRadius: 2 }}>
              Xác nhận
            </button>
            <button onClick={() => setConfirmCancel(false)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', fontSize: 13, borderRadius: 2 }}>
              Không
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ——— MAIN PAGE ———
const OrdersPage = ({ navigate }) => {
  const [dbOrders, setDbOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('https://cuahangquanao.onrender.com/api/orders/myorders');
      setDbOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/api/orders/${orderId}/cancel`, { status: 'Đã hủy' });
      fetchMyOrders();
      setSelectedOrder(null);
      alert('Đã hủy đơn hàng thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Đang tải lịch sử đơn hàng...</div>;

  if (selectedOrder) {
    const latest = dbOrders.find(o => o._id === selectedOrder._id) || selectedOrder;
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
        <OrderDetail order={latest} onBack={() => setSelectedOrder(null)} onCancel={handleCancelOrder} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 60, alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, marginBottom: 20, color: '#111' }}>ĐƠN HÀNG CỦA TÔI</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                {['Mã đơn', 'Thông tin', 'Trạng thái', 'Số sản phẩm', 'Hành động'].map(h => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dbOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                    Bạn chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                dbOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 700, fontSize: 12 }}>
                      #{order._id.slice(-6)}
                    </td>
                    <td style={{ padding: '14px 8px', color: '#555', fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}<br />
                      <strong style={{ color: '#000' }}>{order.totalPrice?.toLocaleString()}đ</strong>
                    </td>
                    {/* Dùng đúng field orderStatus */}
                    <td style={{ padding: '14px 8px' }}>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td style={{ padding: '14px 8px', color: '#555', fontSize: 12 }}>
                      {order.orderItems?.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span
                        onClick={() => setSelectedOrder(order)}
                        style={{ fontSize: 12, color: '#1565C0', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Xem chi tiết
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#111' }}>Tài khoản</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span onClick={() => navigate('/account')} style={{ fontSize: 13, cursor: 'pointer', color: '#444' }}>
              Thông tin tài khoản
            </span>
            <span style={{ fontSize: 13, cursor: 'pointer', color: '#1565C0', textDecoration: 'underline' }}>
              Quản lý đơn hàng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
