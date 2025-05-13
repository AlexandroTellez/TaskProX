import { useEffect } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from 'react-router-dom';

import TaskForm from './components/task/TaskForm';
import Dashboard from './pages/dashboard/Dashboard';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardLayout from './layout/DashboardLayout';
import Proyectos from './pages/dashboard/Proyectos';
import Calendario from './pages/dashboard/Calendario';
import Cuenta from './pages/dashboard/Cuenta'; // ✅ nueva importación
import PrivateRoute from './components/auth/PrivateRoute';

function AppContent() {
  const location = useLocation();
  const hiddenLayoutRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/legal/terminos',
    '/legal/privacidad',
  ];

  const isAuthPage = hiddenLayoutRoutes.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className={`flex-1 w-full ${isAuthPage ? '' : 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'
          }`}
      >
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/legal/terminos" element={<Terms />} />
          <Route path="/legal/privacidad" element={<Privacy />} />

          {/* Rutas protegidas con layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/cuenta" element={<Cuenta />} />
              <Route path="/tasks/new" element={<TaskForm mode="create" />} />
              <Route path="/tasks/:id" element={<TaskForm mode="view" />} />
              <Route path="/tasks/:id/edit" element={<TaskForm mode="edit" />} />
            </Route>
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
