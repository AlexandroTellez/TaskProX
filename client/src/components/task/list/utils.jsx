import { Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

// ==========================
// Devuelve un <Tag> con color según estado de la tarea
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
            color = 'gray'; // Otros estados personalizados
    }

    return <Tag color={color}>{capitalize(status)}</Tag>;
};

// ==========================
// Formatea una fecha en formato legible (ej: lunes, 01/01/2025)
// ==========================
export const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = dayjs(value);
    return date.isValid() ? date.format('dddd, DD/MM/YYYY') : 'Sin fecha';
};

// ==========================
// Devuelve el permiso efectivo del usuario sobre una tarea
// Prioridad:
// 1. Creador de la tarea → admin
// 2. Colaborador directo en la tarea → su permiso
// 3. Permiso del proyecto recibido desde backend (task.project_permission o task.effective_permission)
// 4. Nada → 'none'
// ==========================
export const getPermission = (task, userEmail) => {
    if (!task || !userEmail) return 'none';

    // 1. El creador de la tarea tiene acceso completo
    if (task.creator === userEmail) return 'admin';

    // 2. Permiso directo en la tarea
    const direct = task.collaborators?.find((col) => col.email?.trim() === userEmail);
    if (direct?.permission) return direct.permission;

    // 3. Permiso heredado del proyecto ya incluido en el backend
    return task.project_permission || task.effective_permission || 'none'; //  añadida prioridad efectiva
};

// ==========================
// Capitaliza la primera letra de un texto
// ==========================
const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);
