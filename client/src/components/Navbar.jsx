import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { MenuOutlined } from '@ant-design/icons';

function Navbar() {
    return (
        <header className="flex justify-between items-center py-10 px- sm:px-10 ">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                <img
                    src={logo}
                    alt="TaskProX Logo"
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-all duration-300 group-hover:rotate-6 logo"
                />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    TaskProX
                </h1>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex gap-6 items-center">
                <Link
                    to="/"
                    className="text-neutral-300 hover:text-yellow-400 transition-colors font-semibold text-sm sm:text-base"
                >
                    Dashboard
                </Link>
                <Link
                    to="/proyectos"
                    className="text-neutral-300 hover:text-yellow-400 transition-colors font-semibold text-sm sm:text-base"
                >
                    Proyectos
                </Link>
                <Link
                    to="/calendario"
                    className="text-neutral-300 hover:text-yellow-400 transition-colors font-semibold text-sm sm:text-base"
                >
                    Calendario
                </Link>
                <Link
                    to="/cuenta"
                    className="text-neutral-300 hover:text-yellow-400 transition-colors font-semibold text-sm sm:text-base"
                >
                    Cuenta
                </Link>
            </nav>

            {/* Button Menu Mobile */}
            <button className="sm:hidden p-2 rounded-lg text-neutral-300 hover:text-yellow-400 transition-colors">
                <MenuOutlined style={{ fontSize: '24px' }} />
            </button>

        </header>
    );
}

export default Navbar;
