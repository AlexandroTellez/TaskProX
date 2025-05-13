import { Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

// ==========================
// Etiqueta según estado
// ==========================
export const getStatusTag = (status) => {
    let color;
    switch (status) {
        case 'Completado':
            color = 'green';
            break;
        case 'En proceso':
            color = 'gold';
            break;
        case 'Pendiente':
            color = 'red';
            break;
        case 'En espera':
            color = 'blue';
            break;
        case 'Cancelado':
            color = 'volcano';
            break;
        default:
            color = 'gray';
    }
    return <Tag color={color}>{status || 'Sin estado'}</Tag>;
};

// ==========================
// Formato de fecha
// ==========================
export const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = dayjs(value);
    return date.isValid() ? date.format('dddd, DD/MM/YYYY') : 'Sin fecha';
};

// ==========================
// Permiso efectivo del usuario
// ==========================
export const getPermission = (task, userEmail) => {
    // 1. Si es el creador → admin
    if (task.creator === userEmail) return 'admin';

    // 2. Si tiene campo effective_permission calculado por el backend
    if (task.effective_permission) return task.effective_permission;

    // 3. Si está en colaboradores
    const match = task.collaborators?.find((col) => col.email === userEmail);
    return match?.permission || 'none';
};
