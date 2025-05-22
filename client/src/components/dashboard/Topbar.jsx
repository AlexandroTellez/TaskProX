import { useEffect, useState } from 'react';
import { Avatar, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';
import { MenuOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import useDarkMode from '../../hooks/useDarkMode';

const Topbar = ({ setSidebarOpen }) => {
    const [usuario, setUsuario] = useState(null);
    const [isDarkMode, toggleDarkMode] = useDarkMode();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                const fullName = `${data.first_name} ${data.last_name}`.trim();
                const avatar = data.profile_image
                    ? `data:image/jpeg;base64,${data.profile_image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

                setUsuario({
                    nombre: fullName,
                    avatar,
                });
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
                navigate('/login');
            }
        };

        fetchUser();
    }, [location.pathname]);

    const handleGoToAccount = () => {
        navigate('/cuenta');
    };

    return (
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-[#1A1A1A] dark:text-white">
            {/* Botón hamburguesa en móviles */}
            <button
                className="md:hidden text-black dark:text-white text-xl"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
            >
                <MenuOutlined />
            </button>

            {/* Usuario + modo oscuro */}
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
