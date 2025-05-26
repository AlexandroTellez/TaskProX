// ==========================
// GESTIÓN DE TOKEN Y USUARIO
// ==========================

/**
 * Obtiene el token almacenado en localStorage.
 * @returns {string|null} Token JWT si existe, null si no está disponible.
 */
export const getToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (err) {
        return null;
    }
};

/**
 * Guarda el token JWT en localStorage.
 * @param {string} token - Token de autenticación recibido del backend.
 */
export const setToken = (token) => {
    try {
        localStorage.setItem('token', token);
    } catch (err) {
        // Error al guardar token
    }
};

/**
 * Elimina el token y los datos del usuario del localStorage.
 */
export const removeToken = () => {
    try {
        localStorage.removeItem('token');
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
