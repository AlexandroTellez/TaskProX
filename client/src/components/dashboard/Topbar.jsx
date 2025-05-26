import { useEffect, useState } from 'react';
import { Avatar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';
import { MenuOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import useDarkMode from '../../hooks/useDarkMode';
import { getToken, getUser } from '../../utils/auth';

const Topbar = ({ setSidebarOpen }) => {
    const [usuario, setUsuario] = useState(null);
    const [isDarkMode, toggleDarkMode] = useDarkMode();
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        // Mostrar datos desde localStorage si están disponibles
        const localUser = getUser();
        if (localUser) {
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(localUser.nombre)}&background=random`;
            setUsuario({ nombre: localUser.nombre, avatar });
        }

        // Validar token con el backend para obtener información actualizada
        getCurrentUser()
            .then(data => {
                const fullName = `${data.first_name} ${data.last_name}`.trim();
                const avatar = data.profile_image
                    ? `data:image/jpeg;base64,${data.profile_image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

                setUsuario({ nombre: fullName, avatar });

                // Guardar los datos actualizados en localStorage
                localStorage.setItem(
                    'user',
                    JSON.stringify({ nombre: fullName, email: data.email })
                );
            })
            .catch(() => {
                // En caso de error no hacemos nada visualmente
            });
    }, []);

    const handleGoToAccount = () => {
        navigate('/cuenta');
    };

    return (
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-[#1A1A1A] dark:text-white">
            {/* Botón hamburguesa para dispositivos móviles */}
            <button
                className="md:hidden text-black dark:text-white text-xl"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
            >
                <MenuOutlined />
            </button>

            {/* Información del usuario y botón de modo oscuro */}
            {usuario && (
                <div className="flex items-center gap-4 ml-auto">
                    <Button
                        onClick={toggleDarkMode}
                        type="primary"
                        shape="circle"
                        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                        }}
                    />
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={handleGoToAccount}
                    >
                        <span className="font-medium text-gray-800 dark:text-white">
                            {usuario.nombre}
                        </span>
                        <Avatar
                            src={usuario.avatar}
                            style={{
                                border: '2px solid',
                                backgroundColor: '#FFFFFF',
                            }}
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Topbar;
