import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

function Navbar() {
    return (
        <header className="flex justify-between items-center py-4 px-5 sm:px-10 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-lg my-7">
            {/* Group Logo + Text*/}
            <Link
                to="/"
                className="flex items-center space-x-3 group transition-transform hover:scale-105"
            >
                <img
                    src={logo}
                    alt="TaskProX Logo"
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-all duration-300 group-hover:rotate-6 logo"
                />
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    TaskProX
                </h1>
            </Link>

            {/* Button */}
            <Link
                to="/"
                className="bg-yellow-600 hover:text-slate-900 text-neutral-100 font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-yellow-500/30"
            >
                Dashboard
            </Link>

            <Link
                to="/tasks/new"
                className="bg-yellow-600 hover:text-slate-900 text-neutral-100 font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-yellow-500/30"
            >
                <span className="hidden sm:inline">Mis</span> Proyectos
            </Link>

            <Link
                to="/tasks/new"
                className="bg-yellow-600 hover:text-slate-900 text-neutral-100 font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-yellow-500/30"
            >
                Calendario
            </Link>

            <Link
                to="/tasks/new"
                className="bg-yellow-600 hover:text-slate-900 text-neutral-100 font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-yellow-500/30"
            >
                <span className="hidden sm:inline">Configuración</span>
            </Link>
        </header>
    );
}

export default Navbar;