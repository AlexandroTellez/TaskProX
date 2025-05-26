import axios from 'axios';
import api from './axiosConfig';
import { setToken } from '../utils/auth'; // ✅ Importación del helper actualizado

// URL base desde variables de entorno o localhost por defecto
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ========== LOGIN ==========
/**
 * Inicia sesión del usuario con email y contraseña.
 * Guarda el token JWT y los datos del usuario.
 * Usa localStorage si rememberMe está activo, o sessionStorage si no lo está.
 */
export const loginUser = async ({ email, password, rememberMe }) => {
    try {
        const loginResponse = await axios.post(`${API}/auth/login`, { email, password });
        const { access_token } = loginResponse.data;

        // ✅ Guardar token en el almacenamiento correspondiente (según rememberMe)
        setToken(access_token, rememberMe);

        // Obtener y guardar datos del usuario
        const meResponse = await api.get('/auth/me');
        const { first_name, last_name, email: userEmail, address, postal_code } = meResponse.data;

        const user = {
            nombre: first_name || '',
            apellidos: last_name || '',
            email: userEmail,
            address: address || '',
            postal_code: postal_code || '',
        };

        // Se guarda siempre en localStorage para mantener el nombre en toda la sesión
        localStorage.setItem('user', JSON.stringify(user));

        return { access_token };
    } catch (error) {
        throw error.response?.data || { message: 'Error desconocido al iniciar sesión.' };
    }
};

// ========== REGISTRO ==========
export const registerUser = async (data) => {
    try {
        const res = await axios.post(`${API}/auth/register`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error desconocido al registrar usuario.' };
    }
};

// ========== USUARIO ACTUAL ==========
export const getCurrentUser = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

// ========== RECUPERAR CONTRASEÑA ==========
export const sendForgotPasswordEmail = async (email) => {
    try {
        const res = await axios.post(`${API}/auth/forgot-password`, { email });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al enviar el email de recuperación.' };
    }
};

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
export const deleteAccount = async () => {
    try {
        const res = await api.delete('/auth/delete');
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar la cuenta.' };
    }
};
