import api from './axiosConfig';

const endpoint = '/api/tasks';

// PETICIONES A /api/tasks

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

// Crear una nueva tarea asociada al usuario
export const createTask = (newTask) => api.post(endpoint, newTask);

// Actualizar una tarea existente
export const updateTask = (id, task) => api.put(`${endpoint}/${id}`, task);

// Eliminar una tarea por ID
export const deleteTask = (id) => api.delete(`${endpoint}/${id}`);
