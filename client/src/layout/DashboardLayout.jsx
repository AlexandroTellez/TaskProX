
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 bg-gray-100">
                <Topbar />
                <main className="p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
