import api from './axiosConfig';

const endpoint = '/api/tasks';

/**
 * ===============================
 * Normaliza la estructura de una tarea
 * - Asegura un campo `id` uniforme
 * - Incluye `permission` desde varias posibles fuentes
 * ===============================
 */
const normalizeTask = (task) => ({
    ...task,
    id: task.id || task._id,
    permission:
        task.effective_permission ||
        task.permission ||
        task.project_permission ||
        null,
});

/**
 * ===============================
 * Obtener todas las tareas disponibles para el usuario
 * ===============================
 */
export const fetchTasks = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await api.get(`${endpoint}?${query}`);
    return res.data.map(normalizeTask);
};

/**
 * ===============================
 * Obtener tareas por proyecto con filtros opcionales
 * ===============================
 */
export const fetchTasksByProject = async (projectId, filters = {}) => {
    const query = new URLSearchParams({ projectId, ...filters }).toString();
    const res = await api.get(`${endpoint}?${query}`);

    console.log("🟡 Respuesta cruda de tareas:", res.data);

    return { data: res.data.map(normalizeTask) };
};

/**
 * ===============================
 * Obtener tareas colaborador en un proyecto específico
 * ===============================
 */
export const fetchTasksForCollaboratorByProject = async (projectId) => {
    const res = await api.get(`${endpoint}/by-project/${projectId}`);
    return { data: res.data.map(normalizeTask) };
};

/**
 * ===============================
 * Obtener una tarea individual y normalizarla
 * Devuelve { data: tarea } para compatibilidad con destructuring
 * ===============================
 */
export const fetchTask = async (id) => {
    const res = await api.get(`${endpoint}/${id}`);
    return { data: normalizeTask(res.data) };
};

/**
 * ===============================
 * Crear una nueva tarea con archivos adjuntos
 * ===============================
 */
export const createTask = (taskData, files = []) => {
    const formData = new FormData();
    formData.append('task', JSON.stringify(taskData));
    files.forEach((file) => formData.append('files', file));

    return api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * ===============================
 * Actualizar tarea con archivos adjuntos
 * ===============================
 */
export const updateTask = (id, taskData, files = []) => {
    const formData = new FormData();
    formData.append('task', JSON.stringify(taskData));
    files.forEach((file) => formData.append('files', file));

    return api.put(`${endpoint}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * ===============================
 * Eliminar una tarea por su ID
 * ===============================
 */
export const deleteTask = (id) => api.delete(`${endpoint}/${id}`);
