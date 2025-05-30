import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../../../api/auth';
import { getToken, removeToken } from '../../../utils/auth';

export default function PrivateRoute() {
    const [authStatus, setAuthStatus] = useState('checking');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const token = getToken();

                if (!token) {
                    console.warn(' No hay token. Redirigiendo a login.');
                    setAuthStatus('unauthenticated');
                    return;
                }

                await getCurrentUser();
                setAuthStatus('authenticated');
            } catch (err) {
                console.error(' Error en validación de sesión:', err);
                removeToken();
                setAuthStatus('unauthenticated');
            }
        };

        const timeout = setTimeout(validateToken, 200);
        return () => clearTimeout(timeout);
    }, []);

    if (authStatus === 'checking') {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-500 dark:text-white">
                Cargando sesión...
            </div>
        );
    }

    return authStatus === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />;
}
