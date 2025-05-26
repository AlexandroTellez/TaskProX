import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import logo from "@assets/images/Logo.png";

/**
 * Formulario de inicio de sesión
 * - Muestra el branding a la izquierda (pantallas grandes)
 * - Permite ingresar credenciales, recordar sesión y aceptar términos
 */
function LoginForm({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Leer datos recordados al cargar
    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");
        const remember = localStorage.getItem("rememberMe") === "true";

        if (savedEmail) setEmail(savedEmail);
        if (remember) setRememberMe(true);
    }, []);

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!acceptedTerms || !acceptedPrivacy) {
            alert('Debes aceptar los Términos y la Política de Privacidad.');
            return;
        }

        try {
            setLoading(true);

            // Guardar email y preferencia
            localStorage.setItem("savedEmail", email);
            localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

            await onSubmit({ email, password, rememberMe });
        } catch (err) {
            const msg = err.detail || err.message || 'Error al iniciar sesión';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#1a1a1a] lg:bg-transparent">
            {/* Branding lateral */}
            <div className="lg:w-1/2 w-full bg-white text-black flex justify-center items-center px-4 sm:px-6 py-8 lg:py-16 relative">
                <div className="flex flex-col items-center text-center lg:text-left w-full max-w-md">
                    <div className="flex flex-col lg:flex-row items-center gap-3 mb-4 lg:mb-10">
                        <img src={logo} alt="TaskProX Logo" className="w-14 h-14 lg:w-24 lg:h-24" />
                        <h1 className="text-2xl sm:text-3xl lg:text-7xl font-extrabold text-dark">TaskProX</h1>
                    </div>
                    <div className="w-full">
                        <h1 className="text-xl sm:text-2xl lg:text-7xl font-bold mb-1 lg:mb-4">Organiza.</h1>
                        <h1 className="text-xl sm:text-2xl lg:text-7xl font-bold mb-1 lg:mb-4">Prioriza.</h1>
                        <h1 className="text-xl sm:text-2xl lg:text-7xl font-bold mb-1 lg:mb-4">Colabora.</h1>
                    </div>
                </div>
                <p className="text-xs absolute bottom-2 left-2 lg:bottom-5 lg:left-5 text-gray-500">
                    © 2025 TaskProX. Todos los derechos reservados.
                </p>
            </div>

            {/* Formulario */}
            <div className="lg:w-1/2 w-full bg-[#1a1a1a] text-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-16 py-8">
                <div className="w-full max-w-xs sm:max-w-md lg:max-w-xl">
                    <h2 className="text-xl sm:text-5xl font-bold mb-2"> Inicia sesión</h2>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-xl">Accede a tu espacio de productividad en TaskProX.</p>

                    <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4 lg:space-y-6">
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white"
                            required
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white pr-12"
                                required
                            />
                            <span
                                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-xl text-gray-300 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </span>
                        </div>

                        {/* Recuérdame + Olvido */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs sm:text-sm lg:text-base">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="mt-0.5"
                                />
                                Recuérdame
                            </label>
                            <Link to="/forgot-password" className="text-yellow-400 underline text-xs sm:text-sm lg:text-base">
                                ¿Se te olvidó tu contraseña?
                            </Link>
                        </div>

                        {/* Términos y privacidad */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                onChange={() => setAcceptedTerms(!acceptedTerms)}
                                className="mt-0.5"
                            />
                            <label className="text-xs sm:text-sm lg:text-base">
                                He leído y acepto los{" "}
                                <a href="/legal/terminos" target="_blank" className="text-yellow-400 underline">Términos y Condiciones</a>
                            </label>
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                                className="mt-0.5"
                            />
                            <label className="text-xs sm:text-sm lg:text-base">
                                He leído y acepto la{" "}
                                <a href="/legal/privacidad" target="_blank" className="text-yellow-400 underline">Política de Privacidad</a>
                            </label>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg rounded bg-yellow-300 text-black font-medium"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>

                        {/* Enlace a registro */}
                        <div className="text-center text-xs sm:text-sm lg:text-base">
                            <p className="mb-1">
                                ¿Aún no tienes cuenta?{" "}
                                <Link to="/register" className="text-yellow-300 font-semibold">
                                    Crear nueva cuenta
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
