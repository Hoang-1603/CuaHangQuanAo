import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';

const AdminCustomers = ({ user, navigate, onLogout }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State quản lý Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', isAdmin: false });

  // Gọi API lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('https://cuahangquanao.onrender.com/api/customers');
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải danh sách khách hàng:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (!user.isAdmin && !user.role)) {
      navigate('/login');
      return;
    }
    fetchCustomers();
  }, [user, navigate]);

  // Xử lý xóa khách hàng
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản khách hàng này? Mọi dữ liệu liên quan sẽ bị mất.')) {
      try {
        await api.delete(`/api/customers/${id}`);
        alert('Đã xóa tài khoản thành công!');
        fetchCustomers();
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi xóa khách hàng');
      }
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name || '',
      email: customer.email,
      isAdmin: customer.isAdmin
    });
    setShowEditModal(true);
  };

  // Lưu thông tin chỉnh sửa
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/customers/${selectedCustomer._id}`, editForm);
      alert('Cập nhật thông tin khách hàng thành công!');
      setShowEditModal(false);
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    }
  };

  // Lọc tìm kiếm khách hàng
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f5f7fa' }}>
      
      {/* SIDEBAR */}
      <AdminSidebar activePath={window.location.pathname} navigate={navigate} onLogout={onLogout} />

      {/* NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>Quản lý Khách hàng</h1>
        </div>

        {/* THANH TÌM KIẾM */}
        <div style={{ display: 'flex', gap: 15, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 30 }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, số điện thoại..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 15px', border: '1px solid #ddd', borderRadius: 6, outline: 'none' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Đang tải dữ liệu khách hàng...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>ID Khách hàng</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Họ và tên</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Email / SĐT</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Quyền hạn</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Đăng ký lúc</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Không tìm thấy khách hàng nào.</td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 20px', fontSize: 12, fontFamily: 'monospace', color: '#888' }}>{c._id}</td>
                      <td style={{ padding: '15px 20px', fontWeight: 600, color: '#111' }}>{c.name || 'Chưa cập nhật'}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: 14, color: '#111' }}>{c.email}</div>
                        <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{c.phone || 'Chưa có SĐT'}</div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.isAdmin ? '#e8f5e9' : '#f5f5f5', color: c.isAdmin ? '#2e7d32' : '#555' }}>
                          {c.isAdmin ? 'Admin' : 'Khách hàng'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>
                        {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                          <button onClick={() => { setSelectedCustomer(c); setShowDetailModal(true); }} style={{ padding: '6px 12px', fontSize: 12, background: '#1565C0', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            🛒 Giỏ hàng
                          </button>
                          <button onClick={() => openEditModal(c)} style={{ padding: '6px 12px', fontSize: 12, background: '#f57c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(c._id)} style={{ padding: '6px 12px', fontSize: 12, background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL SỬA THÔNG TIN KHÁCH HÀNG */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '450px', borderRadius: 12, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Chỉnh sửa người dùng</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Họ và tên</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Email liên hệ</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <input type="checkbox" id="isAdmin" checked={editForm.isAdmin} onChange={e => setEditForm({...editForm, isAdmin: e.target.checked})} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor="isAdmin" style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cấp quyền Quản trị viên (Admin)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '10px 25px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT GIỎ HÀNG KHÁCH HÀNG */}
      {showDetailModal && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '550px', maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 15, marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Giỏ hàng của: <span style={{ color: '#1565C0' }}>{selectedCustomer.name || selectedCustomer.email}</span></h3>
              <button onClick={() => setShowDetailModal(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: '#aaa' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {!selectedCustomer.cart || selectedCustomer.cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', fontSize: 14, padding: '20px 0' }}>Khách hàng này hiện chưa bỏ sản phẩm nào vào giỏ.</p>
              ) : (
                selectedCustomer.cart.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 15, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                    <img src={item.image} alt={item.name} style={{ width: 50, height: 60, objectFit: 'cover', borderRadius: 4, background: '#f5f5f5' }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>{item.name}</strong>
                      <span style={{ fontSize: 12, color: '#666', background: '#f0f0f0', padding: '2px 6px', borderRadius: 4, marginRight: 5 }}>Size: {item.size}</span>
                      <span style={{ fontSize: 12, color: '#666', background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>Màu: {item.color}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{item.price?.toLocaleString()}đ</div>
                      <div style={{ fontSize: 12, color: '#888' }}>Số lượng: x{item.quantity}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Tổng tiền giỏ hàng */}
            {selectedCustomer.cart && selectedCustomer.cart.length > 0 && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: 15, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Tổng giá trị dự kiến:</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#d32f2f' }}>
                  {selectedCustomer.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}đ
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;