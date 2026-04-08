import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000/api'
    : 'https://attendease-9xru.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

const getCurrentRoute = () => {
  if (typeof window === 'undefined') return '/';
  const hashRoute = window.location.hash.replace(/^#/, '');
  return hashRoute || window.location.pathname || '/';
};

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const token = sessionStorage.getItem('token');
    const isLoginPage = getCurrentRoute() === '/login';

    if (err.response?.status === 401 && token && !isLoginPage) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.hash = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
