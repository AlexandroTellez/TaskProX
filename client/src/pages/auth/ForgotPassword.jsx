import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import logo from "../../assets/images/Logo.png";
import { sendForgotPasswordEmail } from "../../api/auth";

function ForgotPasswordPage() {
    const handleForgotPassword = async (email) => {
        await sendForgotPasswordEmail(email);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a1a] text-white px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded shadow-2xl text-black">
                {/* Logo + título de TaskProX */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <img src={logo} alt="TaskProX Logo" className="h-12 w-12 sm:h-16 sm:w-16" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-black">TaskProX</h1>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-center">¿Olvidaste tu contraseña?</h2>
                <ForgotPasswordForm onSubmit={handleForgotPassword} />
            </div>
        </div>
    );
}

export default ForgotPasswordPage;