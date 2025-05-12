import {
    LogoutOutlined,
    DashboardOutlined,
    CalendarOutlined,
    FolderOpenOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Opcional: puedes limpiar todo el localStorage si no se usa nada más
        // localStorage.clear();
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white text-black flex flex-col justify-between shadow-xl">
            <div>
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
                    <img src={logo} alt="TaskProX Logo" className="h-8 w-8" />
                    <span className="font-bold text-lg">TaskProX</span>
                </div>

                <nav className="flex flex-col gap-1 mt-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100">
                        <DashboardOutlined /> Dashboard
                    </Link>
                    <Link to="/proyectos" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100">
                        <FolderOpenOutlined /> Proyectos
                    </Link>
                    <Link to="/calendario" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100">
                        <CalendarOutlined /> Calendario
                    </Link>
                    <Link to="/cuenta" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100">
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
        </aside>
    );
};

export default Sidebar;
