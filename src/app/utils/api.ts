/// <reference types="vite/client" />
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global errors (e.g., token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't clear token for /auth/me requests — that's handled by AuthContext.initAuth.
      // Clearing here causes a race condition with Google login where an old token's 401
      // wipes the new valid token before it can be used.
      const url = error.config?.url || '';
      if (!url.endsWith('/auth/me')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth_changed')); // notify AuthContext
      }
    }
    return Promise.reject(error);
  }
);

export default api;
