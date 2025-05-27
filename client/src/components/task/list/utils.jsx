import { Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

// ==========================
// Etiqueta según estado con color fijo
// ==========================
export const getStatusTag = (status) => {
    if (!status) return <Tag color="gray">Sin estado</Tag>;

    const statusLower = status.toLowerCase();
    let color;

    switch (statusLower) {
        case 'pendiente':
            color = 'volcano';
            break;
        case 'en espera':
            color = 'purple';
            break;
        case 'lista para comenzar':
            color = 'blue';
            break;
        case 'en progreso':
            color = 'gold';
            break;
        case 'en revisión':
            color = 'pink';
            break;
        case 'completado':
            color = 'green';
            break;
        default:
            color = 'gray'; // Estados personalizados o desconocidos
    }

    return <Tag color={color}>{capitalize(status)}</Tag>;
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
    if (task.creator === userEmail) return 'admin';
    if (task.effective_permission) return task.effective_permission;
    const match = task.collaborators?.find((col) => col.email === userEmail);
    return match?.permission || 'none';
};

// ==========================
// Capitalizar texto
// ==========================
const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);
