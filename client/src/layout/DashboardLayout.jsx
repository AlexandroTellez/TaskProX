// client/src/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full bg-white text-black">
            {/* Sidebar fijo en escritorio y flotante en móviles */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Contenido principal */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <Topbar setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
