import React from 'react';

const AdminSidebar = ({ activePath, navigate, onLogout }) => {
  const menuItems = [
    { label: '📊 Dashboard', path: '/admin/dashboard' },
    { label: '🛍️ Quản lý Sản phẩm', path: '/admin/products' },
    { label: '📦 Quản lý Đơn hàng', path: '/admin/orders' },
    { label: '👥 Quản lý Khách hàng', path: '/admin/customers' },
    { label: '🎟️ Quản lý Coupon', path: '/admin/coupons' },
  ];

  return (
    <div style={{ width: 260, background: '#111', color: '#fff', padding: '30px 0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', margin: '0 0 40px', letterSpacing: 1 }}>BMINH ADMIN</h2>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, padding: '0 15px' }}>
        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              textAlign: 'left', padding: '14px 20px', 
              background: activePath === item.path ? '#333' : 'transparent',
              color: activePath === item.path ? '#fff' : '#aaa', 
              border: 'none', borderRadius: 6,
              cursor: 'pointer', fontSize: 14, fontWeight: activePath === item.path ? 700 : 500, transition: '.2s'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '0 15px' }}>
        <button onClick={() => { onLogout(); navigate('/'); }} style={{ width: '100%', padding: '14px 20px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;