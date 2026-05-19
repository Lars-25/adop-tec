import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
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
            // Limpiamos los datos locales de forma silenciosa
            localStorage.removeItem('adoptec_token');
            localStorage.removeItem('adoptec_user');

            // Redirigimos al login nativamente
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;