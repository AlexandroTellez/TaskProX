import axios from 'axios';

const API_URL = 'http://localhost:8000/api/projects';

// Obtener todos los proyectos
export const fetchProjects = () => axios.get(API_URL);

// Obtener un proyecto por su ID
export const fetchProjectById = (id) => axios.get(`${API_URL}/${id}`);

// Crear un nuevo proyecto
export const createProject = (project) => axios.post(API_URL, project);

// Actualizar un proyecto existente
export const updateProject = (id, updatedProject) =>
    axios.put(`${API_URL}/${id}`, updatedProject);

// Eliminar un proyecto por su ID
export const deleteProject = (id) => axios.delete(`${API_URL}/${id}`);
