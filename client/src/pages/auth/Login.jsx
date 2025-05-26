import { message } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, loginUser } from '../../api/auth';
import LoginForm from '../../components/auth/login/LoginForm';

function Login() {
    const navigate = useNavigate();

    /**
     * Maneja el envío del formulario de login.
     * Guarda el estado del checkbox "Recuérdame" y redirige al dashboard.
     */
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
            message.error(err?.message || 'Error al iniciar sesión');
        }
    };

    /**
     * Verifica si el usuario ya tiene una sesión activa al cargar el componente.
     * Si el token existe y es válido, redirige automáticamente al dashboard.
     */
    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                await getCurrentUser();
                navigate('/dashboard');
            } catch (err) {
                // Token inválido o expirado: no redirigimos
            }
        };

        validateSession();
    }, []);

    return <LoginForm onSubmit={handleLogin} />;
}

export default Login;
