// Axios configuration for API requests
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Important: send cookies with requests
});

api.interceptors.request.use((config) => {
  if (config?.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  return config;
});

// Add request interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, invalid, or access denied
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.removeItem('user');
      
      // Redirect admin to landing page, others to login
      if (user.role === 'admin') {
        window.location.href = '/';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
