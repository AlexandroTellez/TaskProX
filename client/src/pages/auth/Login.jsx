import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser } from '../../api/auth';
import LoginForm from '../../components/auth/login/LoginForm';
import { message } from 'antd';

function Login() {
    const navigate = useNavigate();

    const handleLogin = async ({ email, password, rememberMe }) => {
        try {
            await loginUser({ email, password });

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }

            navigate('/dashboard');
        } catch (err) {
            console.error(' Error al iniciar sesión:', err);
            message.error(err?.message || 'Error al iniciar sesión');
        }
    };

    //  Verificar si ya está autenticado al cargar la pantalla de login
    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                await getCurrentUser();
                navigate('/dashboard'); // redirigir si está logueado
            } catch (err) {
                console.log('[Login.jsx] Token inválido o expirado.');
            }
        };

        validateSession();
    }, []);

    return <LoginForm onSubmit={handleLogin} />;
}

export default Login;
