import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://attendease-9xru.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const token = sessionStorage.getItem('token');
    const isLoginPage = window.location.pathname === '/login';

    if (err.response?.status === 401 && token && !isLoginPage) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
