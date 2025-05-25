import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../api/auth';

export default function PrivateRoute() {
    const [authStatus, setAuthStatus] = useState('checking');

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            console.log('[PrivateRoute] TOKEN DETECTADO:', token);

            if (!token) {
                console.warn('[PrivateRoute] No hay token → No autenticado');
                setAuthStatus('unauthenticated');
                return;
            }

            try {
                const user = await getCurrentUser();
                console.log('[PrivateRoute] Usuario validado:', user);
                setAuthStatus('authenticated');
            } catch (error) {
                console.error('[PrivateRoute] Token inválido o expirado:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setAuthStatus('unauthenticated');
            }
        };

        validateToken();
    }, []);

    if (authStatus === 'checking') {
        return <div className="text-center p-6">Validando sesión...</div>;
    }

    return authStatus === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />;
}
