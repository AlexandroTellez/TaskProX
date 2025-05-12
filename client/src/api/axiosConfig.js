import axios from 'axios';

// ==========================
// CONFIGURACIÓN DE AXIOS
// ==========================

// URL base del backend, configurable por entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear una instancia de Axios con baseURL
const api = axios.create({
    baseURL: API_URL,
});

// ==========================
// INTERCEPTOR DE SOLICITUDES
// ==========================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================
// INTERCEPTOR DE RESPUESTAS
// ==========================

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Si el token expira o no es válido, forzar logout
            localStorage.removeItem('token');
            localStorage.removeItem('rememberMe');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

// ==========================
// EXPORTAR INSTANCIA DE AXIOS
// ==========================

export default api;
