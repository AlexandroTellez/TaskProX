import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import LoginForm from '../../components/auth/LoginForm';
import { message } from 'antd';

function Login() {
    const navigate = useNavigate();

    const handleLogin = async ({ email, password, rememberMe }) => {
        try {
            // Paso 1: login y obtención de datos del usuario
            await loginUser({ email, password });

            // Paso 2: guardar preferencia de "recordarme"
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }

            // Paso 3: redirigir al dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('❌ Error al iniciar sesión:', err);
            message.error(err?.message || 'Error al iniciar sesión');
        }
    };

    return <LoginForm onSubmit={handleLogin} />;
}

export default Login;
