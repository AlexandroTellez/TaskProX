import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import RegisterForm from '../../components/auth/login/RegisterForm';

function Register() {
    const navigate = useNavigate();

    /**
     * Envía los datos del formulario de registro al backend.
     * Si se registra correctamente, muestra un mensaje y redirige al login.
     */
    const handleRegister = async (formData) => {
        try {
            await registerUser(formData);
            message.success("Usuario registrado correctamente");
            navigate('/login');
        } catch (err) {
            console.error(err);
            message.error("Error al registrar usuario");
        }
    };

    return <RegisterForm onSubmit={handleRegister} />;
}

export default Register;