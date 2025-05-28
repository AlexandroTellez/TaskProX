import api from './axiosConfig';

const endpoint = '/api/tasks';

// Obtener todas las tareas del usuario con filtros opcionales
export const fetchTasks = (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return api.get(`${endpoint}?${query}`);
};

// Obtener tareas filtradas por ID de proyecto
export const fetchTasksByProject = (projectId, filters = {}) => {
    const query = new URLSearchParams({ projectId, ...filters }).toString();
    return api.get(`${endpoint}?${query}`);
};

// Obtener una tarea por su ID
export const fetchTask = (id) => api.get(`${endpoint}/${id}`);

// Crear una nueva tarea con múltiples archivos
export const createTask = (taskData, files = []) => {
    const formData = new FormData();
    formData.append('task', JSON.stringify(taskData));

    files.forEach((file) => {
        formData.append('files', file);
    });

    return api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// 🆕 Actualizar una tarea existente con archivos
export const updateTask = (id, taskData, files = []) => {
    const formData = new FormData();
    formData.append('task', JSON.stringify(taskData));

    files.forEach((file) => {
        formData.append('files', file);
    });

    return api.put(`${endpoint}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Eliminar una tarea por ID
export const deleteTask = (id) => api.delete(`${endpoint}/${id}`);
