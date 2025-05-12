import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import RegisterForm from '../../components/auth/RegisterForm';

function Register() {
    const navigate = useNavigate();

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
