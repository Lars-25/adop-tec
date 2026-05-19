import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: 'https://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de peticiones para inyectar JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adoptec_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para capturar 401/403 (JWT expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('adoptec_token');
      localStorage.removeItem('adoptec_user');
      Swal.fire({
        title: 'Tu sesión ha expirado',
        text: 'Por favor, inicia sesión nuevamente.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ir al Login'
      }).then(() => {
        window.location.href = '/login';
      });
    }
    return Promise.reject(error);
  }
);

export default api;
