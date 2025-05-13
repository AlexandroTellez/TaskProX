// client/src/components/dashboard/Topbar.jsx
import { useEffect, useState } from 'react';
import { Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';
import { MenuOutlined } from '@ant-design/icons';

const Topbar = ({ setSidebarOpen }) => {
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                const fullName = `${data.first_name} ${data.last_name}`.trim();
                setUsuario({
                    nombre: fullName,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
                });
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

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
                <div className="flex items-center gap-3 ml-auto">
                    <span className="font-medium text-gray-800">{usuario.nombre}</span>
                    <Avatar src={usuario.avatar} />
                </div>
            )}
        </header>
    );
};

export default Topbar;
