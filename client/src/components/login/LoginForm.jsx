import { useState } from 'react';
import logo from "../../assets/images/Logo.png";

function LoginForm({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!acceptedTerms || !acceptedPrivacy) {
            alert('Debes aceptar los Términos y la Política de Privacidad.');
            return;
        }
        onSubmit({ email, password });
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#1a1a1a] lg:bg-transparent">
            {/* Lado izquierdo - branding */}
            <div className="lg:w-1/2 w-full bg-white text-black flex justify-center items-center px-4 sm:px-6 py-8 lg:py-16 relative">
                <div className="flex flex-col items-center text-center lg:text-left w-full max-w-md">
                    <div className="flex flex-col lg:flex-row items-center gap-3 mb-4 lg:mb-10">
                        <img src={logo} alt="TaskProX Logo" className="w-14 h-14 lg:w-24 lg:h-24" />
                        <h1 className="text-2xl sm:text-3xl lg:text-7xl font-extrabold text-dark">TaskProX</h1>
                    </div>
                    <div className="w-full">
                        <h1 className="text-xl sm:text-2xl lg:text-7xl font-bold mb-1 lg:mb-4">Organiza.</h1>
                        <h1 className="text-xl sm:text-2xl lg:text-7xl font-bold mb-1 lg:mb-4">Prioriza.</h1>
                        <h1 className="text-xl sm:text-2xl lg:text-7xl font-bold mb-1 lg:mb-4">Simplifica.</h1>
                    </div>
                </div>

                <p className="text-xs absolute bottom-2 left-2 lg:bottom-5 lg:left-5 text-gray-500">
                    © 2025 TaskProX. Todos los derechos reservados.
                </p>
            </div>

            {/* Lado derecho - formulario */}
            <div className="lg:w-1/2 w-full bg-[#1a1a1a] text-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-16 py-8">
                <div className="w-full max-w-xs sm:max-w-md lg:max-w-xl">
                    <h2 className="text-xl sm:text-5xl font-bold mb-2">¡Hola!</h2>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-xl">Bienvenido a TaskProX, completa tu registro.</p>
                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white"
                            required
                        />

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                onChange={() => setAcceptedTerms(!acceptedTerms)}
                                className="mt-0.5"
                            />
                            <label className="text-xs sm:text-sm lg:text-base">
                                He leído y acepto los <span className="text-yellow-400">{" "}
                                    <a href="/legal/terminos" target="_blank" className="text-yellow-400 underline">Términos y Condiciones</a></span>
                            </label>
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                                className="mt-0.5"
                            />
                            <label className="text-xs sm:text-sm lg:text-base">
                                He leído y acepto la <span className="text-yellow-400">{" "}
                                    <a href="/legal/privacidad" target="_blank" className="text-yellow-400 underline">Política de Privacidad</a></span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg rounded bg-yellow-300 text-black font-medium"
                        >
                            Entrar
                        </button>

                        <p className="text-center text-xs sm:text-sm lg:text-base">
                            ¿Aún no tienes cuenta?{" "}
                            <a href="/register" className="text-yellow-300 font-semibold">
                                Crear nueva cuenta
                            </a>
                        </p>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default LoginForm;