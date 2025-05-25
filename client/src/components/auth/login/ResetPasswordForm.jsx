import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

function ResetPasswordForm({ onSubmit }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password.trim() || !confirmPassword.trim()) {
            return message.warning("Todos los campos son obligatorios.");
        }

        if (password !== confirmPassword) {
            return message.error("Las contraseñas no coinciden.");
        }

        try {
            setLoading(true);
            await onSubmit(password);
            message.success("¡Contraseña restablecida con éxito! Redirigiendo...");

            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (error) {
            message.error(error?.message || "Error al restablecer la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg bg-white p-8 rounded shadow-2xl text-black">
            <h2 className="text-2xl font-bold text-center mb-4">Restablecer contraseña</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
                Ingresa una nueva contraseña para tu cuenta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nueva contraseña */}
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 pr-10 border border-gray-300 rounded"
                    />
                    <span
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </span>
                </div>

                {/* Confirmar contraseña */}
                <div className="relative">
                    <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 pr-10 border border-gray-300 rounded"
                    />
                    <span
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        {showConfirm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded"
                >
                    {loading ? "Restableciendo..." : "Restablecer contraseña"}
                </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-4">
                <a href="/login" className="text-yellow-500 hover:underline">
                    Volver al inicio de sesión
                </a>
            </p>
        </div>
    );
}

export default ResetPasswordForm;
