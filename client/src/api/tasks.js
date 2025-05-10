import axios from "axios";

const URL = "http://localhost:8000";
const endpoint = `${URL}/api/tasks`;

// Obtener todas las tareas
export const fetchTasks = () => axios.get(endpoint);

// Obtener una tarea específica
export const fetchTask = (id) => axios.get(`${endpoint}/${id}`);

// Crear una nueva tarea
export const createTask = (newTask) => axios.post(endpoint, newTask);

// Actualizar una tarea
export const updateTask = (id, task) => axios.put(`${endpoint}/${id}`, task);

// Borrar una tarea
export const deleteTask = (id) => axios.delete(`${endpoint}/${id}`);

//
export const fetchTasksByProject = (projectId) =>
    axios.get(`http://localhost:8000/api/tasks?projectId=${projectId}`);

