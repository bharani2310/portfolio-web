import axios from 'axios';
import { dispatchAdminTokenExpired } from '../utils/authEvents';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Don't just remove localStorage here — that leaves the live React
      // auth state (isAuthenticated, token) stale until a full page
      // reload. Instead, notify AdminAuthProvider so it can do a real
      // logout: clear localStorage, reset state, and clear cached admin
      // data, all in one place.
      dispatchAdminTokenExpired();
    }
    const message =
      error?.response?.data?.message || error?.message || 'Something went wrong';
    return Promise.reject({ ...error, message });
  }
);

export default api;
