import React, { useState } from 'react';
import api from '../api/api'; // Import trạm phát dữ liệu kết nối Backend

const LoginPage = ({ navigate, onLogin }) => {
  const [tab, setTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Thêm state loading để chống spam click

  const setL = (f, v) => setLoginForm(p => ({ ...p, [f]: v }));
  const setR = (f, v) => setRegForm(p => ({ ...p, [f]: v }));

  // ——— XỬ LÝ ĐĂNG NHẬP THẬT ———
  const handleLogin = async () => {
    const e = {};
    if (!loginForm.email.trim()) e.email = 'Vui lòng nhập email';
    if (!loginForm.password) e.password = 'Vui lòng nhập mật khẩu';
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setErrors({});

    const credentials = { email: loginForm.email.trim(), password: loginForm.password };

    // 1. Thử đăng nhập Customer trước
    try {
      const { data } = await api.post('https://cuahangquanao.onrender.com/api/customers/login', credentials);
      onLogin(data);
      setLoading(false);
      return; // Đăng nhập thành công → dừng lại
    } catch (customerErr) {
      const status = customerErr.response?.status;

      // Nếu sai mật khẩu (401) → không thử staff, báo lỗi luôn
      if (status === 401) {
        setLoading(false);
        setErrors({ email: 'Email hoặc mật khẩu không chính xác.' });
        return;
      }
      // Nếu tài khoản bị khóa (403) → báo lỗi luôn
      if (status === 403) {
        setLoading(false);
        setErrors({ email: customerErr.response?.data?.message || 'Tài khoản đã bị khóa.' });
        return;
      }
      // Nếu không tìm thấy (404) → email này có thể là Staff, thử tiếp
    }

    // 2. Thử đăng nhập Staff (chỉ khi customer trả về 404)
    try {
      const { data } = await api.post('https://cuahangquanao.onrender.com/api/staff/login', credentials);
      onLogin(data);
      setLoading(false);
    } catch (staffErr) {
      setLoading(false);
      const status = staffErr.response?.status;
      if (status === 403) {
        setErrors({ email: staffErr.response?.data?.message || 'Tài khoản đã bị khóa.' });
      } else {
        setErrors({ email: 'Email hoặc mật khẩu không chính xác.' });
      }
    }
  };

  // ——— XỬ LÝ ĐĂNG KÝ THẬT ———
  const handleRegister = async () => {
    const e = {};
    if (!regForm.name.trim()) e.rname = 'Vui lòng nhập họ tên';
    if (!regForm.email.trim()) e.remail = 'Vui lòng nhập email';
    if (!regForm.password) e.rpassword = 'Vui lòng nhập mật khẩu';
    if (regForm.password !== regForm.confirm) e.rconfirm = 'Mật khẩu không khớp';
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      setLoading(true);
      // Gửi request tạo user mới lên Backend
      const { data } = await api.post('https://cuahangquanao.onrender.com/api/customers', {
        name: regForm.name,
        email: regForm.email,
        password: regForm.password
      });
      
      // Đăng ký xong tự động đăng nhập luôn
      onLogin(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrors({ remail: err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.' });
    }
  };

  const inp = (err) => ({
    width: '100%', padding: '12px 0', border: 'none',
    borderBottom: '1px solid ' + (err ? '#e53935' : '#ddd'),
    outline: 'none', fontSize: 14, background: 'transparent',
    fontFamily: 'inherit', color: '#222', boxSizing: 'border-box',
  });

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%' }}>
      <div style={{ width: '100%', maxWidth: 440, border: '1px solid #eee', borderRadius: 4 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {[['login', 'ĐĂNG NHẬP'], ['register', 'ĐĂNG KÝ']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setErrors({}); }}
              style={{
                flex: 1, padding: '16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
                borderBottom: tab === key ? '2px solid #000' : '2px solid transparent',
                color: tab === key ? '#000' : '#888', transition: '.2s',
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '32px 36px' }}>
          {tab === 'login' ? (
            <div>
              <div style={{ marginBottom: 20 }}>
                <input placeholder="Nhập email" value={loginForm.email}
                  onChange={e => setL('email', e.target.value)} style={inp(errors.email)} 
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                {errors.email && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
              </div>
              <div style={{ marginBottom: 24 }}>
                <input type="password" placeholder="Mật khẩu" value={loginForm.password}
                  onChange={e => setL('password', e.target.value)} style={inp(errors.password)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                {errors.password && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors.password}</p>}
              </div>
              <button onClick={handleLogin} disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? '#888' : '#000', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1 }}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
                <span style={{ color: '#1565C0', cursor: 'pointer', textDecoration: 'underline' }}>Quên mật khẩu?</span>
              </p>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: '20px 0 16px' }}>Hoặc đăng nhập với</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: '11px', background: '#1877F2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 900 }}>f</span> Đăng nhập bằng Facebook
                </button>
                <button style={{ flex: 1, padding: '11px', background: '#222', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>G</span> Đăng nhập bằng Google
                </button>
              </div>
            </div>
          ) : (
            <div>
              {[
                { label: 'Họ và tên *', field: 'name', key: 'rname', type: 'text' },
                { label: 'Email *', field: 'email', key: 'remail', type: 'email' },
                { label: 'Mật khẩu *', field: 'password', key: 'rpassword', type: 'password' },
                { label: 'Xác nhận mật khẩu *', field: 'confirm', key: 'rconfirm', type: 'password' },
              ].map(({ label, field, key, type }) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <input type={type} placeholder={label} value={regForm[field]}
                    onChange={e => setR(field, e.target.value)} style={inp(errors[key])} 
                    onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                  {errors[key] && <p style={{ color: '#e53935', fontSize: 11, marginTop: 4 }}>{errors[key]}</p>}
                </div>
              ))}
              <button onClick={handleRegister} disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? '#888' : '#000', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1, marginTop: 6 }}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;