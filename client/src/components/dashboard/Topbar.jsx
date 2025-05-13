import { useEffect, useState } from 'react';
import { Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';
import { MenuOutlined } from '@ant-design/icons';

const Topbar = ({ setSidebarOpen }) => {
    const [usuario, setUsuario] = useState(null);
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
        <header className="flex justify-between items-center px-6 py-4 bg-white">
            {/* Botón hamburguesa en móviles */}
            <button
                className="md:hidden text-black text-xl"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
            >
                <MenuOutlined />
            </button>

            {/* Usuario */}
            {usuario && (
                <div
                    className="flex items-center gap-3 ml-auto cursor-pointer"
                    onClick={handleGoToAccount}
                >
                    <span className="font-medium text-gray-800">{usuario.nombre}</span>
                    <Avatar src={usuario.avatar} />
                </div>
            )}
        </header>
    );
};

export default Topbar;
