import { Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

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

export const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = dayjs(value);
    return date.isValid()
        ? date.format('dddd, DD/MM/YYYY') // ⬅️ Incluye el día de la semana
        : 'Sin fecha';
};

export const getPermission = (task, userFullName, userEmail) => {
    if (task.creator_name === userFullName) return 'admin';
    const match = task.collaborators?.find((col) => col.email === userEmail);
    return match?.permission || 'none';
};
