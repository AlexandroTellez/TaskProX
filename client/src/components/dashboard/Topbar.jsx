import { useEffect, useState } from 'react';
import { Avatar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';
import { MenuOutlined, SunFilled, MoonFilled } from '@ant-design/icons';
import useDarkMode from '../../hooks/useDarkMode';
import { getToken, getUser } from '../../utils/auth';

const Topbar = ({ setSidebarOpen }) => {
    const [usuario, setUsuario] = useState(null);
    const [isDarkMode, toggleDarkMode] = useDarkMode();
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const localUser = getUser();
        if (localUser) {
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(localUser.nombre)}&background=random`;
            setUsuario({ nombre: localUser.nombre, avatar });
        }

        getCurrentUser()
            .then(data => {
                const fullName = `${data.first_name} ${data.last_name}`.trim();
                const avatar = data.profile_image
                    ? `data:image/jpeg;base64,${data.profile_image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

                setUsuario({ nombre: fullName, avatar });

                localStorage.setItem(
                    'user',
                    JSON.stringify({ nombre: fullName, email: data.email })
                );
            })
            .catch(() => { });
    }, []);

    const handleGoToAccount = () => {
        navigate('/cuenta');
    };

    return (
        <header className="flex flex-wrap justify-between items-center w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-[#1f1f1f] dark:text-white overflow-auto">
            {/* Botón hamburguesa visible solo en pantallas pequeñas */}
            <button
                className="lg:hidden text-black dark:text-white text-xl"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
            >
                <MenuOutlined />
            </button>

            <div className='flex sm:justify-center items-center gap-4 ml-5'>
                <Button
                    onClick={toggleDarkMode}
                    type="primary"
                    shape="circle"
                    icon={isDarkMode ? <SunFilled /> : <MoonFilled />}
                    style={{
                        backgroundColor: isDarkMode ? '#1f1f1f' : '#FFFFFF',
                        borderColor: isDarkMode ? '#FED36A' : '#1f1f1f',
                        color: isDarkMode ? '#FED36A' : '#1f1f1f',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                    }}
                />
            </div>

            {/* Usuario y botón modo oscuro */}
            {usuario && (
                <div className="flex items-center gap-4 ml-auto">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={handleGoToAccount}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleGoToAccount();
                            }
                        }}
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
