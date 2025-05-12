import { useState } from "react";
import { message } from "antd";

function ForgotPasswordForm({ onSubmit }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            return message.warning("Por favor, introduce tu correo electrónico");
        }

        try {
            setLoading(true);
            await onSubmit(email);
            message.success("Si el correo está registrado, recibirás instrucciones para restablecer la contraseña");
        } catch (error) {
            message.error("Ocurrió un error al enviar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-2 text-center">
                Introduce tu correo electrónico para recibir un enlace de recuperación.
            </p>
            <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded"
            >
                {loading ? "Enviando..." : "Enviar enlace"}
            </button>
            <p className="text-sm text-center text-gray-500 mt-4">
                <a href="/login" className="text-yellow-500 hover:underline">
                    Volver al inicio de sesión
                </a>
            </p>
        </form>
    );
}

export default ForgotPasswordForm;
