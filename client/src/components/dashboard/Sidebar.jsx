import {
    LogoutOutlined,
    DashboardOutlined,
    CalendarOutlined,
    FolderOpenOutlined,
    UserOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Componente común del menú (para evitar duplicación)
    const menuContent = (
        <div className="flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
                    <img src={logo} alt="TaskProX Logo" className="h-8 w-8" />
                    <span className="font-bold text-lg">TaskProX</span>
                </div>

                <nav className="flex flex-col gap-1 mt-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                        <DashboardOutlined /> Dashboard
                    </Link>
                    <Link to="/proyectos" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                        <FolderOpenOutlined /> Proyectos
                    </Link>
                    <Link to="/calendario" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                        <CalendarOutlined /> Calendario
                    </Link>
                    <Link to="/cuenta" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                        <UserOutlined /> Cuenta
                    </Link>
                </nav>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 border-t border-gray-200 transition-colors"
            >
                <LogoutOutlined /> Cerrar sesión
            </button>
        </div>
    );

    return (
        <>
            {/* Sidebar fijo en escritorio */}
            <aside className="hidden md:flex w-64 bg-white text-black flex-col justify-between shadow-xl">
                {menuContent}
            </aside>

            {/* Sidebar móvil */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Overlay oscuro */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel lateral */}
                    <div className="relative z-50 w-64 bg-white text-black flex flex-col justify-between shadow-xl">
                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black"
                        >
                            <CloseOutlined />
                        </button>

                        {menuContent}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
