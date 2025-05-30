import { message } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, loginUser } from '../../api/auth';
import { getToken } from '../../utils/auth';
import LoginForm from '../../components/auth/login/LoginForm';

function Login() {
    const navigate = useNavigate();

    /**
     * Envía los datos de inicio de sesión.
     * Si es exitoso, guarda la opción "Recuérdame" y redirige al dashboard.
     */
    const handleLogin = async ({ email, password, rememberMe }) => {
        try {
            await loginUser({ email, password, rememberMe });

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
     * Comprueba si ya hay una sesión activa al montar el componente.
     * Si el token es válido, redirige automáticamente al dashboard.
     */
    useEffect(() => {
        const validateSession = async () => {
            const token = getToken(); // Busca en localStorage o sessionStorage
            if (!token) return;

            try {
                await getCurrentUser();
                navigate('/dashboard');
            } catch (err) {
                // Si el token es inválido o ha expirado, no se redirige
            }
        };

        validateSession();
    }, []);

    return <LoginForm onSubmit={handleLogin} />;
}

export default Login;
