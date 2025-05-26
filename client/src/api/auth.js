import axios from 'axios';
import api from './axiosConfig';

// URL base desde variables de entorno o localhost por defecto
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ========== LOGIN ==========
/**
 * Inicia sesión del usuario con email y contraseña.
 * Guarda el token JWT y los datos del usuario en localStorage.
 */
export const loginUser = async (credentials) => {
    try {
        const loginResponse = await axios.post(`${API}/auth/login`, credentials);
        const { access_token } = loginResponse.data;

        // Guardar token en localStorage
        localStorage.setItem('token', access_token);

        // Obtener y guardar datos del usuario
        const meResponse = await api.get('/auth/me');
        const { first_name, last_name, email, address, postal_code } = meResponse.data;

        const user = {
            nombre: first_name || '',
            apellidos: last_name || '',
            email,
            address: address || '',
            postal_code: postal_code || '',
        };

        localStorage.setItem('user', JSON.stringify(user));

        return { access_token };
    } catch (error) {
        throw error.response?.data || { message: 'Error desconocido al iniciar sesión.' };
    }
};

// ========== REGISTRO ==========
/**
 * Registra un nuevo usuario en el sistema.
 */
export const registerUser = async (data) => {
    try {
        const res = await axios.post(`${API}/auth/register`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error desconocido al registrar usuario.' };
    }
};

// ========== USUARIO ACTUAL ==========
/**
 * Obtiene los datos del usuario autenticado.
 */
export const getCurrentUser = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

// ========== RECUPERAR CONTRASEÑA ==========
/**
 * Envía un correo electrónico para restablecer la contraseña.
 */
export const sendForgotPasswordEmail = async (email) => {
    try {
        const res = await axios.post(`${API}/auth/forgot-password`, { email });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al enviar el email de recuperación.' };
    }
};

/**
 * Restablece la contraseña usando el token recibido por email.
 */
export const resetPassword = async (token, password) => {
    try {
        const res = await axios.post(`${API}/auth/reset-password`, {
            token,
            password,
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al restablecer la contraseña.' };
    }
};

// ========== ACTUALIZAR PERFIL ==========
/**
 * Actualiza el perfil del usuario, incluyendo imagen y datos personales.
 */
export const updateProfile = async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (key === 'profileImage' && value instanceof File) {
            formData.append('profileImage', value);
        } else if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });

    try {
        const res = await api.put('/auth/profile', formData);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar el perfil.' };
    }
};

// ========== ELIMINAR CUENTA ==========
/**
 * Elimina permanentemente la cuenta del usuario autenticado.
 */
export const deleteAccount = async () => {
    try {
        const res = await api.delete('/auth/delete');
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar la cuenta.' };
    }
};
