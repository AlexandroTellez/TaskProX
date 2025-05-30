import api from './axiosConfig';

const endpoint = '/api/projects';

// ================== Obtener todos los proyectos del usuario autenticado ==================
/**
 * Devuelve todos los proyectos del usuario.
 * Aplica fallback de _id a id para compatibilidad con backend antiguo.
 */
export const fetchProjects = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await api.get(`${endpoint}?${queryParams}`);
    const projects = res.data.map((project) => ({
        ...project,
        id: project.id || project._id, // Compatibilidad con MongoDB
    }));
    return projects;
};


// ================== Obtener detalles de un proyecto específico ==================
export const fetchProjectById = (id) => api.get(`${endpoint}/${id}`);

// ================== Crear un nuevo proyecto asociado al usuario ==================
export const createProject = (project) => api.post(endpoint, project);

// ================== Actualizar un proyecto existente por ID ==================
export const updateProject = (id, updatedProject) =>
    api.put(`${endpoint}/${id}`, updatedProject);

// ================== Eliminar un proyecto por ID ==================
export const deleteProject = (id) => api.delete(`${endpoint}/${id}`);

// ================== Obtener resumen de progreso del usuario ==================
export const fetchProjectSummary = () => api.get(`${endpoint}/summary`);
