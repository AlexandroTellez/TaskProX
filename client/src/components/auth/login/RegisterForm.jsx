import { useState } from "react";
import logo from "@assets/images/Logo.png";
import { message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

function RegisterForm({ onSubmit }) {
    const [form, setForm] = useState({
        nombre: '',
        apellidos: '',
        direccion: '',
        codigoPostal: '',
        email: '',
        password: '',
        repetirPassword: '',
        terminos: false,
        privacidad: false,
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {
            nombre, apellidos, direccion, codigoPostal, email,
            password, repetirPassword, terminos, privacidad
        } = form;

        if (!nombre || !apellidos || !direccion || !codigoPostal || !email || !password || !repetirPassword) {
            return message.warning('Todos los campos son obligatorios');
        }

        if (password !== repetirPassword) {
            return message.error('Las contraseñas no coinciden');
        }

        if (!terminos || !privacidad) {
            return message.warning('Debes aceptar los términos y la política de privacidad');
        }

        const dataToSend = {
            first_name: nombre,
            last_name: apellidos,
            address: direccion,
            postal_code: codigoPostal,
            email,
            password
        };

        try {
            setLoading(true);
            await onSubmit(dataToSend);
        } catch (err) {
            const msg = err.detail || err.message || 'Error al registrar usuario';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen w-full flex flex-col lg:flex-row overflow-y-auto">

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

            {/* ====== Columna derecha (formulario) ====== */}
            <div className="w-full lg:w-1/2 bg-[#1a1a1a] text-white flex flex-col items-center px-4 sm:px-6 lg:px-16 py-10 overflow-y-auto h-full">


                <div className="w-full max-w-xs sm:max-w-md lg:max-w-xl flex flex-col justify-center my-auto pb-10">

                    {/* Logo superior visible solo en dispositivos menores a lg */}
                    <div className="lg:hidden flex flex-row items-center justify-start gap-3 mb-6 px-6 md:px-10">
                        <img src={logo} alt="TaskProX Logo" className="w-16 h-16 md:w-20 md:h-20 dark:invert" />
                        <h1 className="text-4xl md:text-5xl font-bold">TaskProX</h1>
                    </div>

                    <h2 className="text-xl sm:text-5xl font-bold mb-2">Crear cuenta</h2>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-xl">Bienvenido a TaskProX, completa tu registro.</p>

                    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 lg:space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white" required />
                            <input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} className="p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white" required />
                            <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} className="p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white md:col-span-2" required />
                            <input name="codigoPostal" placeholder="Código Postal" value={form.codigoPostal} onChange={handleChange} className="p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white" required />
                        </div>

                        <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} className="w-full p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white" required />

                        {/* Contraseña */}
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={handleChange}
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

                        {/* Repetir contraseña */}
                        <div className="relative">
                            <input
                                name="repetirPassword"
                                type={showRepeatPassword ? "text" : "password"}
                                placeholder="Repetir contraseña"
                                value={form.repetirPassword}
                                onChange={handleChange}
                                className="w-full p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg bg-transparent border border-gray-400 rounded text-white pr-12"
                                required
                            />
                            <span
                                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-xl text-gray-300 cursor-pointer"
                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                            >
                                {showRepeatPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </span>
                        </div>

                        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="terminos" checked={form.terminos} onChange={handleChange} className="mt-0.5" />
                                <label className="text-xs sm:text-sm lg:text-base">
                                    He leído y acepto los <a href="/legal/terminos" target="_blank" className="text-yellow-400 underline">Términos y Condiciones</a>
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="privacidad" checked={form.privacidad} onChange={handleChange} className="mt-0.5" />
                                <label className="text-xs sm:text-sm lg:text-base">
                                    He leído y acepto la <a href="/legal/privacidad" target="_blank" className="text-yellow-400 underline">Política de Privacidad</a>
                                </label>
                            </div>

                            <div className="text-center text-xs sm:text-sm lg:text-base">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 lg:py-5 text-sm sm:text-base lg:text-lg rounded bg-yellow-300 text-black font-medium"
                                >
                                    {loading ? "Registrando..." : "Registrarse"}
                                </button>

                                <p className="text-center text-xs sm:text-sm lg:text-base p-1">
                                    ¿Ya tienes cuenta?{" "}
                                    <a href="/login" className="text-yellow-300 font-semibold">
                                        Inicia sesión
                                    </a>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterForm;
