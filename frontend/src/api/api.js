import axios from 'axios';

// Khi deploy Vercel: đặt VITE_API_URL = https://cuahangquanao.onrender.com trong Vercel Environment Variables
// Khi chạy local: để trống, Vite proxy sẽ tự forward /api -> localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gửi token theo mỗi request
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  if (userInfo?.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;
