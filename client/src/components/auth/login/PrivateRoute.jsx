import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../../../api/auth';
import { getToken, removeToken } from '../../../utils/auth';

/**
 * Componente para proteger rutas privadas.
 * Valida si el token es válido y permite el acceso a las rutas internas.
 */
export default function PrivateRoute() {
    // Estado para manejar la autenticación: checking | authenticated | unauthenticated
    const [authStatus, setAuthStatus] = useState('checking');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const token = getToken();

                // Si no hay token, redirigir a login
                if (!token) {
                    setAuthStatus('unauthenticated');
                    return;
                }

                // Verificar token con el backend
                await getCurrentUser();
                setAuthStatus('authenticated');
            } catch (error) {
                // Token inválido o expirado
                removeToken();
                setAuthStatus('unauthenticated');
            }
        };

        // Delay breve para evitar lecturas simultáneas tras login
        const timeout = setTimeout(validateToken, 300);

        // Limpiar timeout al desmontar el componente
        return () => clearTimeout(timeout);
    }, []);

    // Mostrar mensaje mientras se valida la sesión
    if (authStatus === 'checking') {
        return <div className="text-center p-6">Validando sesión...</div>;
    }

    // Rutas protegidas o redirección a login
    return authStatus === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />;
}
