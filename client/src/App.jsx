import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import TaskForm from './components/task/TaskForm';
import Dashboard from './pages/dashboard/Dashboard';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Login from './pages/login/Login';
import Register from './pages/registro/Register';
import DashboardLayout from '../src/layout/DashboardLayout';
import Proyectos from './pages/dashboard/Proyectos';
import Calendario from './pages/dashboard/Calendario';

function AppContent() {
  const location = useLocation();
  const hiddenLayoutRoutes = [
    '/',
    '/login',
    '/register',
    '/legal/terminos',
    '/legal/privacidad',
  ];

  const isAuthPage = hiddenLayoutRoutes.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`flex-1 w-full ${isAuthPage ? '' : 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <Routes>
          {/* Páginas públicas (sin layout) */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legal/terminos" element={<Terms />} />
          <Route path="/legal/privacidad" element={<Privacy />} />

          {/* Páginas protegidas con layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/proyectos" element={<Proyectos />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/tasks/new" element={<TaskForm mode="create" />} />
            <Route path="/tasks/:id" element={<TaskForm mode="view" />} />
            <Route path="/tasks/:id/edit" element={<TaskForm mode="edit" />} />
            {/* Agrega aquí otras páginas como proyectos, calendario, cuenta, etc. */}
          </Route>
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
