import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('million_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If session expired or unauthorized on private route
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/barber')) {
        localStorage.removeItem('million_token');
        localStorage.removeItem('million_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
