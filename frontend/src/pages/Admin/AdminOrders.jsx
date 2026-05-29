import React, { useState, useEffect } from 'react';
import api from '../../api/api'; // Hãy điều chỉnh lại số dấu chấm nếu bạn để file trong folder con
import AdminSidebar from '../../components/AdminSidebar';
 
const AdminOrders = ({ user, navigate, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
 
  // State xem chi tiết đơn hàng bằng Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
 
  // Gọi API lấy toàn bộ danh sách đơn hàng từ hệ thống
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải danh sách hóa đơn:', error);
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (!user || (!user.isAdmin && !user.role)) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);
 
  // Cập nhật trạng thái xử lý đơn hàng (Chờ xác nhận -> Đang xử lý -> Đang giao -> Đã giao)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      alert('Cập nhật trạng thái đơn hàng thành công!');
      
      // Cập nhật lại dữ liệu hiển thị trong modal nếu đang mở đơn đó
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data);
      }
      
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn');
    }
  };
 
  // Hủy hoặc xóa đơn hàng hoàn toàn khỏi hệ thống
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này khỏi hệ thống không?')) {
      try {
        await api.delete(`/api/orders/${orderId}`);
        alert('Đã xóa đơn hàng thành công!');
        setShowDetailModal(false);
        fetchOrders();
      } catch (error) {
        alert('Lỗi khi thực hiện xóa đơn hàng');
      }
    }
  };
 
  // Lọc đơn hàng dựa trên trạng thái được chọn trên thanh công cụ
  const filteredOrders = statusFilter ? orders.filter(o => o.orderStatus === statusFilter) : orders;
 
 
  // Hàm phụ trợ tạo màu sắc nhãn trạng thái trực quan
  const getStatusBadgeStyle = (status) => {
    const styles = {
      'Chờ xác nhận': { color: '#b78103', bg: '#fff8e1' },
      'Đang xử lý': { color: '#1565c0', bg: '#e3f2fd' },
      'Đang giao': { color: '#6a1b9a', bg: '#f3e5f5' },
      'Đã giao': { color: '#2e7d32', bg: '#e8f5e9' },
      'Đã hủy': { color: '#c62828', bg: '#ffebee' }
    };
    return styles[status] || { color: '#333', bg: '#eee' };
  };
 
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f5f7fa' }}>
      
      {/* SIDEBAR TƯƠNG ĐỒNG CÁC TRANG TRƯỚC */}
      <AdminSidebar activePath={window.location.pathname} navigate={navigate} onLogout={onLogout} />
 
      {/* NỘI DUNG QUẢN LÝ ĐƠN HÀNG */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>Quản lý Đơn hàng</h1>
        </div>
 
        {/* THANH BỘ LỌC TRẠNG THÁI */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
          {['', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', background: statusFilter === status ? '#111' : '#fff',
                color: statusFilter === status ? '#fff' : '#555', transition: '.2s'
              }}
            >
              {status === '' ? 'Tất cả đơn' : status}
            </button>
          ))}
        </div>
 
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Đang tải dữ liệu hóa đơn...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Mã đơn hàng</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Khách hàng</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Ngày đặt hàng</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Tổng thanh toán</th>
 
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Trạng thái đơn</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Không ghi nhận đơn hàng nào phù hợp với bộ lọc hiện tại.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const badge = getStatusBadgeStyle(order.orderStatus);
                    return (
                      <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px 20px', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>{order._id}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{order.user?.name || 'Khách vãng lai'}</div>
                          <div style={{ fontSize: 12, color: '#777' }}>{order.user?.email || order.shippingAddress?.phone}</div>
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '15px 20px', fontWeight: 700, color: '#111' }}>{order.totalPrice?.toLocaleString()}đ</td>
 
                        <td style={{ padding: '15px 20px' }}>
                          {(() => {
                            const flow = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao'];
                            const currentIdx = flow.indexOf(order.orderStatus);
                            const nextStatus = currentIdx !== -1 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: badge.color, background: badge.bg, padding: '4px 12px', borderRadius: 12, whiteSpace: 'nowrap' }}>
                                  {order.orderStatus}
                                </span>
                                {nextStatus && (
                                  <button
                                    onClick={() => handleUpdateStatus(order._id, nextStatus)}
                                    title={`Chuyển sang: ${nextStatus}`}
                                    style={{ padding: '3px 10px', fontSize: 11, fontWeight: 700, background: '#1565c0', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    → {nextStatus}
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                            style={{ padding: '6px 14px', fontSize: 12, background: '#111', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Xem Chi Tiết
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
 
      {/* MODAL CHI TIẾT ĐƠN HÀNG & CẬP NHẬT TRẠNG THÁI TRỰC TIẾP */}
      {showDetailModal && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '650px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 12, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 15, marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Chi tiết đơn hàng: <span style={{ fontFamily: 'monospace', fontSize: 15, color: '#1565c0' }}>{selectedOrder._id}</span></h2>
              <button onClick={() => setShowDetailModal(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: '#aaa' }}>&times;</button>
            </div>
 
            {/* THÔNG TIN GIAO NHẬN HÀNG */}
            <div style={{ marginBottom: 20, background: '#f8f9fa', padding: 15, borderRadius: 6 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>Thông tin nhận hàng</h4>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{selectedOrder.shippingAddress?.name} — {selectedOrder.shippingAddress?.phone}</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#444' }}>{selectedOrder.shippingAddress?.address}{selectedOrder.shippingAddress?.ward ? ', ' + selectedOrder.shippingAddress.ward : ''}{selectedOrder.shippingAddress?.district ? ', ' + selectedOrder.shippingAddress.district : ''}{selectedOrder.shippingAddress?.city ? ', ' + selectedOrder.shippingAddress.city : ''}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#555' }}>Thanh toán: <strong>{selectedOrder.paymentMethod}</strong></p>
            </div>
 
            {/* DANH SÁCH QUẦN ÁO ĐÃ ĐẶT */}
            <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>Danh sách sản phẩm mua ({selectedOrder.orderItems?.length || 0})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #eee', padding: 10, borderRadius: 6, marginBottom: 25 }}>
              {selectedOrder.orderItems?.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: index !== selectedOrder.orderItems.length - 1 ? '1px solid #eee' : 'none', paddingBottom: index !== selectedOrder.orderItems.length - 1 ? 10 : 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: 45, height: 55, objectFit: 'cover', borderRadius: 4, background: '#f5f5f5' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#111' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Phân loại: <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 4 }}>Size {item.size}</span> | <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 4 }}>Màu {item.color}</span></p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{item.price?.toLocaleString()}đ</div>
                    <div style={{ color: '#777', fontSize: 12 }}>SL: x{item.quantity}</div>
                  </div>
                </div>
              ))}
              {/* Tóm tắt giá */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 6 }}>
                  <span>Tạm tính:</span>
                  <span>{selectedOrder.itemsPrice?.toLocaleString() ?? selectedOrder.totalPrice?.toLocaleString()}đ</span>
                </div>
                {selectedOrder.shippingPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 6 }}>
                    <span>Phí vận chuyển:</span>
                    <span>+{selectedOrder.shippingPrice?.toLocaleString()}đ</span>
                  </div>
                )}
                {selectedOrder.couponCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#2e7d32', fontWeight: 600 }}>🏷 Voucher <span style={{ fontFamily: 'monospace', background: '#e8f5e9', padding: '1px 6px', borderRadius: 4 }}>{selectedOrder.couponCode}</span>:</span>
                    <span style={{ color: '#2e7d32', fontWeight: 600 }}>-{selectedOrder.discountPrice?.toLocaleString()}đ</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4 }}>
                  <span>Tổng thanh toán:</span>
                  <span style={{ color: '#d32f2f' }}>{selectedOrder.totalPrice?.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
 
            {/* XỬ LÝ ĐƠN HÀNG */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  style={{ padding: '10px 18px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  Xóa đơn hàng
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  Đóng lại
                </button>
              </div>
            </div>
 
          </div>
        </div>
      )}
    </div>
  );
};
 
export default AdminOrders;