import axios from 'axios';
import api from './axiosConfig';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ========== LOGIN ==========
export const loginUser = async (credentials) => {
    try {
        const loginResponse = await axios.post(`${API}/auth/login`, credentials);
        const { access_token } = loginResponse.data;

        localStorage.setItem('token', access_token);

        // Pedir info del usuario
        const meResponse = await api.get('/auth/me');
        const { first_name, last_name, email } = meResponse.data;

        // Si no hay nombre/apellidos, fallback
        localStorage.setItem('user', JSON.stringify({
            nombre: first_name || '',
            apellidos: last_name || '',
            email,
        }));

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
