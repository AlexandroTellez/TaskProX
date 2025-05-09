import { useState } from 'react'
import { Input, Button, message } from 'antd'

/**
 * AuthForm component reutilizable para Login y Registro
 *
 * @param {Object} props
 * @param {string} props.title - Título del formulario (ej: "Iniciar Sesión", "Registrarse")
 * @param {string} props.buttonText - Texto del botón
 * @param {Function} props.onSubmit - Función a ejecutar al enviar el formulario
 * @param {string} props.footerText - Texto debajo del formulario
 * @param {string} props.footerLinkText - Texto del enlace en el footer
 * @param {Function} props.onFooterClick - Acción al hacer click en el enlace del footer
 */
function AuthForm({
    title,
    buttonText,
    onSubmit,
    footerText,
    footerLinkText,
    onFooterClick
}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            return message.warning('Completa todos los campos');
        }
        try {
            await onSubmit({ email, password });
        } catch (err) {
            message.error("Correo o contraseña incorrectos");
        }
    };


    return (
        <div className="flex justify-center items-center h-screen bg-neutral-900">
            <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-white text-center mb-6">{title}</h2>
                <div className="mb-4">
                    <Input
                        placeholder="Correo electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <Input.Password
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button type="primary" htmlType="submit" className="w-full">
                    {buttonText}
                </Button>
                <p className="text-neutral-300 text-center mt-4">
                    {footerText}{' '}
                    <span
                        className="text-yellow-400 cursor-pointer"
                        onClick={onFooterClick}
                    >
                        {footerLinkText}
                    </span>
                </p>
            </form>
        </div>
    )
}

export default AuthForm
