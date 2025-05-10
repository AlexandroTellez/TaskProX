import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen ">
            <Sidebar />
            <div className="flex flex-col flex-1 bg-white shadow-2xl">
                <Topbar />
                <main className="p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
