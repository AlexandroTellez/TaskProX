import { useSearchParams, useNavigate } from 'react-router-dom';
import ResetPasswordForm from '../../components/auth/login/ResetPasswordForm';
import logo from '../../assets/images/Logo.png';
import { resetPassword } from '../../api/auth';
import { useEffect, useState } from 'react';
import { message } from 'antd';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [validToken, setValidToken] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            message.error("Token no proporcionado.");
            setValidToken(false);
        }
    }, [token]);

    const handleResetPassword = async (newPassword) => {
        try {
            await resetPassword(token, newPassword);
            message.success("¡Contraseña cambiada con éxito!");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            message.error(err?.detail || "Hubo un error al restablecer la contraseña.");
        }
    };

    if (!validToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
                <p className="text-center text-lg">Token inválido o no proporcionado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a1a] text-white px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded shadow-2xl text-black">
                {/* Logo + título */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <img src={logo} alt="TaskProX Logo" className="h-12 w-12 sm:h-16 sm:w-16" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-black">TaskProX</h1>
                </div>

                <ResetPasswordForm onSubmit={handleResetPassword} />
            </div>
        </div>
    );
};

export default ResetPassword;
