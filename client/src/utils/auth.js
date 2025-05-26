// ==========================
// GESTIÓN DE TOKEN Y USUARIO
// ==========================

/**
 * Obtiene el token desde localStorage o sessionStorage.
 * @returns {string|null} Token JWT si existe, null si no está disponible.
 */
export const getToken = () => {
    try {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch (err) {
        return null;
    }
};

/**
 * Guarda el token JWT en localStorage (si rememberMe) o sessionStorage.
 * @param {string} token - Token de autenticación recibido del backend.
 * @param {boolean} rememberMe - Indica si se debe guardar de forma persistente.
 */
export const setToken = (token, rememberMe = false) => {
    try {
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
    } catch (err) {
        // Error al guardar token
    }
};

/**
 * Elimina el token de ambos storages y los datos del usuario.
 */
export const removeToken = () => {
    try {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
    } catch (err) {
        // Error al eliminar token/usuario
    }
};

/**
 * Obtiene los datos del usuario desde localStorage.
 * @returns {Object|null} Objeto con los datos del usuario o null si no hay datos válidos.
 */
export const getUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (err) {
        return null;
    }
};
