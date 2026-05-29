// import React, { useState } from 'react';

// const ChangePasswordPage = ({ navigate }) => {
//   const [form, setForm] = useState({ old: '', new: '', confirm: '' });
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState(false);
//   const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

//   const handleSubmit = () => {
//     const e = {};
//     if (!form.old) e.old = 'Vui lòng nhập mật khẩu cũ';
//     if (!form.new) e.new = 'Vui lòng nhập mật khẩu mới';
//     if (form.new.length < 6) e.new = 'Mật khẩu tối thiểu 6 ký tự';
//     if (form.new !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp';
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setSuccess(true);
//     setForm({ old: '', new: '', confirm: '' });
//     setTimeout(() => setSuccess(false), 3000);
//   };

//   const inp = (field) => ({
//     width: '100%', padding: '10px 12px',
//     border: '1px solid ' + (errors[field] ? '#e53935' : '#ddd'),
//     fontSize: 13, outline: 'none', borderRadius: 4, boxSizing: 'border-box',
//     fontFamily: 'inherit', color: '#222',
//   });
//   const labelStyle = { fontSize: 13, color: '#444', textAlign: 'right', paddingRight: 20, paddingTop: 11 };

//   const Row = ({ label, field, placeholder }) => (
//     <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', marginBottom: 16, alignItems: 'start' }}>
//       <span style={labelStyle}>{label}</span>
//       <div>
//         <input type="password" placeholder={placeholder} value={form[field]}
//           onChange={e => { set(field, e.target.value); setErrors(er => ({ ...er, [field]: '' })); }}
//           style={inp(field)} />
//         {errors[field] && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors[field]}</p>}
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
//       <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: '#111' }}>Đổi mật khẩu</h1>
//       <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginBottom: 40 }}>
//         Trang chủ / Đổi mật khẩu
//       </p>

//       {success && (
//         <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 4, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#2e7d32', textAlign: 'center' }}>
//           ✓ Đổi mật khẩu thành công!
//         </div>
//       )}

//       <Row label="Mật khẩu cũ:" field="old" placeholder="Mật khẩu cũ" />
//       <Row label="Mật khẩu mới:" field="new" placeholder="Mật khẩu mới" />
//       <Row label="Xác Mật khẩu :" field="confirm" placeholder="Xác Mật khẩu" />

//       <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
//         <button onClick={handleSubmit}
//           style={{ padding: '11px 48px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, borderRadius: 2 }}>
//           Xác nhận
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChangePasswordPage;


import React, { useState } from 'react';
import api from '../api/api';

const ChangePasswordPage = ({ navigate }) => {
  const [form, setForm] = useState({ old: '', new: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.old) e.old = 'Vui lòng nhập mật khẩu cũ';
    if (!form.new) e.new = 'Vui lòng nhập mật khẩu mới';
    if (form.new.length < 6) e.new = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.new !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp';
    if (Object.keys(e).length) { setErrors(e); return; }
    
    try {
      setLoading(true);
      
      // Gọi API cập nhật password
      await api.put('/api/customers/profile', {
        oldPassword: form.old,
        password: form.new
      });

      setSuccess(true);
      setForm({ old: '', new: '', confirm: '' });
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrors({ old: err.response?.data?.message || 'Mật khẩu cũ không chính xác' });
      setLoading(false);
    }
  };

  const inp = (field) => ({
    width: '100%', padding: '10px 12px',
    border: '1px solid ' + (errors[field] ? '#e53935' : '#ddd'),
    fontSize: 13, outline: 'none', borderRadius: 4, boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#222',
  });
  const labelStyle = { fontSize: 13, color: '#444', textAlign: 'right', paddingRight: 20, paddingTop: 11 };

  const Row = ({ label, field, placeholder }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', marginBottom: 16, alignItems: 'start' }}>
      <span style={labelStyle}>{label}</span>
      <div>
        <input type="password" placeholder={placeholder} value={form[field]}
          onChange={e => { set(field, e.target.value); setErrors(er => ({ ...er, [field]: '' })); }}
          style={inp(field)} />
        {errors[field] && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors[field]}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: '#111' }}>Đổi mật khẩu</h1>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginBottom: 40 }}>
        Trang chủ / Đổi mật khẩu
      </p>

      {success && (
        <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 4, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#2e7d32', textAlign: 'center' }}>
          ✓ Đổi mật khẩu thành công!
        </div>
      )}

      <Row label="Mật khẩu cũ:" field="old" placeholder="Mật khẩu cũ" />
      <Row label="Mật khẩu mới:" field="new" placeholder="Mật khẩu mới" />
      <Row label="Xác Mật khẩu :" field="confirm" placeholder="Xác Mật khẩu" />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{ padding: '11px 48px', background: loading ? '#888' : '#333', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, borderRadius: 2 }}>
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;