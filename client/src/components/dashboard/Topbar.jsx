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
        if (!token) {
            console.warn("⛔ No hay token, usuario no autenticado.");
            return;
        }

        console.log("🔄 Cargando usuario desde getCurrentUser...");

        getCurrentUser()
            .then(data => {
                console.log("✅ Datos del backend:", data);

                const first = (data.first_name || "").trim();
                const last = (data.last_name || "").trim();
                const fullName = `${first} ${last}`.trim();

                const avatar = data.profile_image
                    ? `data:image/jpeg;base64,${data.profile_image}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

                const nuevoUsuario = {
                    first_name: first,
                    last_name: last,
                    email: data.email,
                    address: data.address || '',
                    postal_code: data.postal_code || '',
                };

                // Actualiza localStorage y estado
                localStorage.setItem("user", JSON.stringify(nuevoUsuario));
                setUsuario({ first_name: first, last_name: last, avatar });

                console.log("🧠 Estado del usuario actualizado en Topbar:", { first, last });
            })
            .catch(err => {
                console.error("❌ Error al obtener el usuario:", err);
            });
    }, []);



    const handleGoToAccount = () => {
        navigate('/cuenta');
    };

    // ⏳ Mostrar mensaje mientras se carga el usuario
    if (!usuario) {
        return (
            <header className="px-4 py-4 bg-white dark:bg-[#1f1f1f]">
                <span className="text-gray-500 dark:text-gray-400">Cargando usuario...</span>
            </header>
        );
    }

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

            {/* Botón modo claro/oscuro */}
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

            {/* Usuario */}
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
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        {usuario.first_name} {usuario.last_name}
                    </span>

                    <Avatar
                        src={usuario.avatar}
                        style={{
                            border: '2px solid #FFFFFF',
                            backgroundColor: '#FFFFFF',
                        }}
                    />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
