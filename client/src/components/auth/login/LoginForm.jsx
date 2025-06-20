import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import logo from "@assets/images/Logo.png";

function LoginForm({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const remember = localStorage.getItem("rememberMe") === "true";
        if (remember) {
            const savedEmail = localStorage.getItem("savedEmail");
            if (savedEmail) setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!acceptedTerms || !acceptedPrivacy) {
            alert('Debes aceptar los Términos y la Política de Privacidad.');
            return;
        }

        try {
            setLoading(true);

            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
                localStorage.setItem("savedEmail", email);
            } else {
                localStorage.removeItem("rememberMe");
                localStorage.removeItem("savedEmail");
            }

            await onSubmit({ email, password, rememberMe });

        } catch (err) {
            const msg = err.detail || err.message || 'Error al iniciar sesión';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-full w-full flex flex-col lg:flex-row overflow-y-auto">
            {/* ====== Columna izquierda (branding) ====== */}
            <div className="hidden lg:flex w-full lg:w-1/2 bg-white text-black justify-center items-center px-4 sm:px-6 py-8 lg:py-16 relative">
                <div className="flex flex-col items-center text-center lg:text-left w-full max-w-md">
                    <div className="flex flex-col lg:flex-row items-center gap-3 mb-4 lg:mb-10">
                        <img src={logo} alt="TaskProX Logo" className="w-14 h-14 md:w-20 lg:w-24 md:h-20 lg:h-24" />
                        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-extrabold text-dark">TaskProX</h1>
                    </div>
                    <div className="w-full">
                        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-7xl font-bold mb-1 lg:mb-4">Organiza.</h1>
                        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-7xl font-bold mb-1 lg:mb-4">Prioriza.</h1>
                        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-7xl font-bold mb-1 lg:mb-4">Colabora.</h1>
                    </div>
                </div>
                <p className="text-xs absolute bottom-2 left-2 lg:bottom-5 lg:left-5 text-gray-500">
                    © 2025 TaskProX. Todos los derechos reservados.
                </p>
            </div>

            {/* Columna derecha - Formulario */}
            <div className="w-full lg:w-1/2 bg-[#1a1a1a] text-white flex flex-col items-center px-4 sm:px-6 lg:px-16 py-10 overflow-y-auto h-screen">

                <div className="w-full max-w-xs sm:max-w-md lg:max-w-xl flex flex-col justify-center my-auto pb-10">

                    {/* Logo superior visible solo en dispositivos menores a lg */}
                    <div className="lg:hidden flex flex-row items-center justify-start gap-3 mb-6 px-6 md:px-10">
                        <img src={logo} alt="TaskProX Logo" className="w-16 h-16 md:w-20 md:h-20 dark:invert" />
                        <h1 className="text-4xl md:text-5xl font-bold">TaskProX</h1>
                    </div>

                    <h2 className="text-xl sm:text-5xl font-bold mb-2">Inicia sesión</h2>
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
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <Link to="/forgot-password" className="text-yellow-400 underline text-xs sm:text-sm lg:text-base">
                                    ¿Se te olvidó tu contraseña?
                                </Link>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs sm:text-sm lg:text-base">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="mt-0.5"
                                    />
                                    Recuérdame.
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                                    className="mt-0.5"
                                />
                                <label className="text-xs sm:text-sm lg:text-base">
                                    He leído y acepto los{" "}
                                    <a href="/legal/terminos" target="_blank" className="text-yellow-400 underline">Términos y Condiciones.</a>
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
                                    className="mt-0.5"
                                />
                                <label className="text-xs sm:text-sm lg:text-base">
                                    He leído y acepto la{" "}
                                    <a href="/legal/privacidad" target="_blank" className="text-yellow-400 underline">Política de Privacidad.</a>
                                </label>
                            </div>

                            <div className="text-center text-xs sm:text-sm lg:text-base">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg rounded bg-yellow-300 text-black font-medium"
                                >
                                    {loading ? "Entrando..." : "Entrar"}
                                </button>
                                <p className="p-2 mb-4">
                                    ¿Aún no tienes cuenta?{" "}
                                    <Link to="/register" className="text-yellow-300 font-semibold">
                                        Crear nueva cuenta
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
