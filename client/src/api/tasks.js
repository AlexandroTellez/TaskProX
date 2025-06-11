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
 * Convertir archivos (File) a base64 para envío
 * ===============================
 */
const convertFilesToBase64 = async (files) => {
    const result = [];

    for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

        result.push({
            name: file.name,
            type: file.type,
            data: base64,
        });
    }

    return result;
};

/**
 * ===============================
 * Crear una nueva tarea con archivos adjuntos (JSON con base64)
 * ===============================
 */
export const createTask = async (taskData, files = []) => {
    // Conservar archivos antiguos que ya están en base64
    const recursoExistente = (taskData.recurso || []).filter(file => !(file instanceof File));
    const recursoNuevo = await convertFilesToBase64(files);

    const payload = {
        ...taskData,
        recurso: [...recursoExistente, ...recursoNuevo],
    };

    // Debug solo en entorno local
    if (import.meta.env.DEV) {
        console.log("📤 Creando nueva tarea (JSON):", payload);
    }

    return api.post(endpoint, payload);
};

/**
 * ===============================
 * Actualizar tarea con archivos adjuntos (JSON con base64)
 * ===============================
 */
export const updateTask = async (id, taskData, files = []) => {
    // Conservar archivos antiguos
    const recursoExistente = (taskData.recurso || []).filter(file => !(file instanceof File));
    const recursoNuevo = await convertFilesToBase64(files);

    const payload = {
        ...taskData,
        recurso: [...recursoExistente, ...recursoNuevo],
    };

    // Logs de depuración en desarrollo
    if (import.meta.env.DEV) {
        console.log(`📤 Actualizando tarea ID ${id} (JSON):`, payload);
    }

    const res = await api.post(`${endpoint}/${id}/update`, payload);
    return { data: normalizeTask(res.data) };

};

/**
 * ===============================
 * Actualizar estados de tareas
 * ===============================
 */

export const updateTaskStatus = async (id, newStatus) => {
    const res = await api.patch(`/api/tasks/${id}/status`, { status: newStatus });
    return normalizeTask(res.data);
};


/**
 * ===============================
 * Eliminar una tarea por su ID
 * ===============================
 */
export const deleteTask = (id) => api.delete(`${endpoint}/${id}`);
