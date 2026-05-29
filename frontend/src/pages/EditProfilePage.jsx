import React, { useState } from 'react';
import api from '../api/api';
 
const EditProfilePage = ({ user, navigate, onUpdateUser }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    tinh: user?.tinh || user?.city || '',
    huyen: user?.huyen || user?.district || '',
    phuong: user?.phuong || user?.ward || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
 
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
 
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ và tên';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    return e;
  };
 
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    try {
      setLoading(true);
      setSuccess('');
      const { data } = await api.put('https://cuahangquanao.onrender.com/api/customers/profile', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        tinh: form.tinh,
        huyen: form.huyen,
        phuong: form.phuong,
        address: form.address,
      });
      if (onUpdateUser) onUpdateUser(data);
      setSuccess('Cập nhật thông tin thành công!');
      setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật thông tin');
      setLoading(false);
    }
  };
 
  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${errors[field] ? '#e53935' : '#ddd'}`,
    fontSize: 13,
    outline: 'none',
    borderRadius: 4,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#222',
  });
 
  const labelStyle = { fontSize: 13, color: '#555', display: 'block', marginBottom: 6 };
 
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '80vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 5% 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <span style={{ cursor: 'pointer', fontSize: 13, color: '#888' }} onClick={() => navigate && navigate('/account')}>‹ Tài khoản</span>
          <span style={{ color: '#ccc' }}>|</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Chỉnh sửa thông tin</h2>
        </div>
 
        {success && (
          <div style={{ background: '#f0faf4', border: '1px solid #a5d6a7', borderRadius: 4, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>
            ✓ {success}
          </div>
        )}
 
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '28px 32px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>Thông tin cá nhân</h3>
 
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Họ và tên *</label>
            <input value={form.name} onChange={e => { set('name', e.target.value); setErrors(er => ({ ...er, name: '' })); }} style={inputStyle('name')} placeholder="Nhập họ và tên" />
            {errors.name && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
          </div>
 
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={form.email} onChange={e => { set('email', e.target.value); setErrors(er => ({ ...er, email: '' })); }} style={inputStyle('email')} placeholder="email@example.com" type="email" />
              {errors.email && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>Số điện thoại *</label>
              <input value={form.phone} onChange={e => { set('phone', e.target.value); setErrors(er => ({ ...er, phone: '' })); }} style={inputStyle('phone')} placeholder="0xxxxxxxxx" />
              {errors.phone && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors.phone}</p>}
            </div>
          </div>
 
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f0f0f0', marginTop: 28 }}>Địa chỉ giao hàng</h3>
 
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Tỉnh / Thành phố</label>
              <input value={form.tinh} onChange={e => set('tinh', e.target.value)} style={inputStyle('tinh')} placeholder="VD: An Giang" />
            </div>
            <div>
              <label style={labelStyle}>Quận / Huyện</label>
              <input value={form.huyen} onChange={e => set('huyen', e.target.value)} style={inputStyle('huyen')} placeholder="VD: Long Xuyên" />
            </div>
          </div>
 
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phường / Xã</label>
            <input value={form.phuong} onChange={e => set('phuong', e.target.value)} style={inputStyle('phuong')} placeholder="VD: Phường Mỹ Bình" />
          </div>
 
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Địa chỉ chi tiết (số nhà, tên đường)</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} style={inputStyle('address')} placeholder="VD: 123 Nguyễn Trãi" />
          </div>
 
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button
              onClick={() => navigate && navigate('/account')}
              style={{ flex: 1, padding: '13px', background: '#fff', color: '#555', border: '1px solid #ddd', fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 4 }}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 2, padding: '13px', background: loading ? '#888' : '#1565C0', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 4, letterSpacing: 0.3 }}
            >
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default EditProfilePage;