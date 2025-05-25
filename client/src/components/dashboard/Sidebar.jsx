import {
    LogoutOutlined,
    DashboardOutlined,
    CalendarOutlined,
    FolderOpenOutlined,
    UserOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from "@assets/images/Logo.png";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuContent = (
        <div className="flex flex-col justify-between h-full w-full">
            <div>
                {/* Logo y nombre */}
                <Link  to="/dashboard" className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <img src={logo} alt="TaskProX Logo" className="h-8 w-8 dark:invert" />
                    <span className="font-bold text-lg dark:text-white">TaskProX</span>
                    
                </Link>

                {/* Navegación */}
                <nav className="flex flex-col gap-1 mt-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <DashboardOutlined /> Dashboard
                    </Link>
                    <Link
                        to="/proyectos"
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <FolderOpenOutlined /> Proyectos
                    </Link>
                    <Link
                        to="/calendario"
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <CalendarOutlined /> Calendario
                    </Link>
                    <Link
                        to="/cuenta"
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <UserOutlined /> Cuenta
                    </Link>
                </nav>
            </div>

            {/* Botón cerrar sesión */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 transition-colors"
            >
                <LogoutOutlined /> Cerrar sesión
            </button>
        </div>
    );

    return (
        <>
            {/* Sidebar fijo en escritorio */}
            <aside className="hidden md:flex h-screen w-64 bg-white text-black dark:bg-[#1A1A1A] dark:text-white flex-col justify-between shadow-xl">
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
                    <div className="relative z-50 w-64 h-full bg-white text-black dark:bg-[#1A1A1A] dark:text-white flex flex-col justify-between shadow-xl">
                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
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
