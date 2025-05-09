import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import LoginForm from '../../components/login/LoginForm';

function Login() {
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        try {
            const res = await loginUser(credentials);
            localStorage.setItem('token', res.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return <LoginForm onSubmit={handleLogin} />;
}

export default Login;
