import axios from 'axios';

// ==========================
// CONFIGURACIÓN DE AXIOS
// ==========================

// URL base del backend desde entorno (Vite)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de Axios con configuración base
const api = axios.create({
    baseURL: API_URL,
});

// ==========================
// INTERCEPTOR DE SOLICITUDES
// ==========================

/**
 * Añade el token JWT a cada solicitud si está disponible.
 * Busca primero en localStorage (persistente) y luego en sessionStorage (temporal).
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

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

/**
 * Maneja errores globales.
 * Si el token está expirado o no autorizado (401), el flujo lo gestionará `PrivateRoute`.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error.response?.data || error)
);

// ==========================
// EXPORTAR INSTANCIA DE AXIOS
// ==========================

export default api;
