import api from './axiosConfig';

const endpoint = '/api/projects';

// PETICIONES A /api/projects

// Obtener todos los proyectos del usuario autenticado
export const fetchProjects = () => api.get(endpoint);

// Obtener detalles de un proyecto específico
export const fetchProjectById = (id) => api.get(`${endpoint}/${id}`);

// Crear un nuevo proyecto asociado al usuario
export const createProject = (project) => api.post(endpoint, project);

// Actualizar un proyecto existente por ID
export const updateProject = (id, updatedProject) =>
    api.put(`${endpoint}/${id}`, updatedProject);

// Eliminar un proyecto por ID
export const deleteProject = (id) => api.delete(`${endpoint}/${id}`);

// Obtener resumen de progreso (pendiente, en proceso, completado)
export const fetchProjectSummary = () => api.get(`${endpoint}/summary`);
