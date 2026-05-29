import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = ({ user, navigate, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chặn truy cập nếu không phải Admin/Nhân viên
  useEffect(() => {
    if (!user || (!user.isAdmin && !user.role)) {
      navigate('/login');
      return;
    }

    // Gọi API lấy dữ liệu thống kê
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/dashboard');
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);


  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: 16 }}>Đang tải dữ liệu hệ thống...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f5f7fa' }}>
      
      {/* SIDEBAR */}
      <AdminSidebar activePath={window.location.pathname} navigate={navigate} onLogout={onLogout} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>Tổng quan hệ thống</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#555' }}>Xin chào, <strong>{user?.name}</strong></span>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc' }}></div>
          </div>
        </div>

        {/* 4 THẺ THỐNG KÊ CHÍNH */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          {[
            { title: 'TỔNG DOANH THU', value: `${stats?.revenue?.total?.toLocaleString()}đ`, color: '#2e7d32' },
            { title: 'TỔNG ĐƠN HÀNG', value: stats?.revenue?.totalOrders, color: '#1565C0' },
            { title: 'TỔNG KHÁCH HÀNG', value: stats?.customers?.total, color: '#f57c00' },
            { title: 'TỔNG SẢN PHẨM', value: stats?.products?.total, color: '#d32f2f' },
          ].map(card => (
            <div key={card.title} style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', margin: '0 0 10px' }}>{card.title}</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: card.color, margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* CỘT ĐÔI: TRẠNG THÁI ĐƠN HÀNG & SẢN PHẨM TỒN KHO THẤP */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          
          {/* Trạng thái đơn hàng */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: '#111' }}>Tình trạng đơn hàng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(stats?.orders || {}).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                  <span style={{ fontSize: 14, color: '#444' }}>{status}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, background: '#f5f5f5', padding: '4px 12px', borderRadius: 20 }}>{count} đơn</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sản phẩm tồn kho thấp */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: '#111' }}>Cảnh báo tồn kho thấp (Dưới 10)</h3>
            {stats?.products?.lowStock?.length === 0 ? (
              <p style={{ fontSize: 13, color: '#888' }}>✅ Không có sản phẩm nào sắp hết hàng.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats?.products?.lowStock?.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', border: '1px solid #ffebee', background: '#fffcfc', borderRadius: 6 }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: '#d32f2f', margin: 0 }}>Tồn kho: <strong>{p.countInStock}</strong></p>
                    </div>
                    <button onClick={() => navigate('/admin/products')} style={{ padding: '6px 12px', fontSize: 11, background: '#111', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                      Nhập thêm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;