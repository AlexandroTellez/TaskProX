import axios from "axios";

const URL = "http://localhost:8000";
const endpoint = `${URL}/api/tasks`;

// This is the function of fetch tasks used to obtain all the tasks
export const fetchTasks = () => axios.get(endpoint);

// This is the function of fetch task uesed to obtain a specific task
export const fetchTask = (id) => axios.get(`/${endpoint}/${id}`);

// This is the function of create task used to create a new task
export const createTask = (newTask) => axios.post(endpoint, newTask);

// This is the function of update task used to update a task
export const updateTask = (id, task) => axios.put(`${endpoint}/${id}`, task);

// This is the function of delete task used to delete a task
export const deleteTask = (id) => axios.delete(`${endpoint}/${id}`);
