import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-white text-black dark:bg-[#1f1f1f] dark:text-white">
            {/* Sidebar fijo en escritorio y flotante en móviles */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Contenido principal */}
            <div className="flex flex-col flex-1 w-full">
                <Topbar setSidebarOpen={setSidebarOpen} />

                {/* Scroll vertical y horizontal aquí */}
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <main className="min-w-full min-h-full p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
