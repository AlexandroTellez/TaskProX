import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const loginUser = async (data) => {
    const res = await axios.post(`${API}/auth/login`, data)
    return res.data
}

export const registerUser = async (data) => {
    const res = await axios.post(`${API}/auth/register`, data)
    return res.data
}
