import { useNavigate } from 'react-router-dom';
import { deleteTask, updateTask } from '../../api/tasks';
import { useState } from 'react';
import { getPermission } from './list/utils'; // ✅ Añadido

function TaskCard({ task, onTaskChanged }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userEmail = user.email || '';

    // ✅ Calcular permiso con lógica centralizada
    const permission = getPermission(task, userEmail);
    const canEdit = permission === 'writer' || permission === 'admin';
    const canDelete = permission === 'admin';

    // ============================
    // Marcar tarea como completada
    // ============================
    const handleToggleCompleted = async (e) => {
        e.stopPropagation();
        try {
            setLoading(true);
            const taskId = task._id || task.id;
            const res = await updateTask(taskId, { completed: !task.completed });
            if (res.status === 200 && onTaskChanged) {
                onTaskChanged();
            }
        } catch (err) {
            console.error('Error al actualizar tarea:', err);
        } finally {
            setLoading(false);
        }
    };

    // ============================
    // Eliminar tarea con confirmación
    // ============================
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
            try {
                const taskId = task._id || task.id;
                await deleteTask(taskId);
                if (onTaskChanged) onTaskChanged();
            } catch (err) {
                console.error('Error al eliminar tarea:', err);
            }
        }
    };

    const taskId = task._id || task.id;

    return (
        <div
            className="flex flex-col p-6 rounded-xl shadow-md border border-neutral-200 bg-white text-black transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={() => navigate(`/tasks/${taskId}`)}
        >
            {/* ========== Encabezado ========== */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h2 className="font-bold text-xl break-words whitespace-normal">
                        {task.title}
                    </h2>
                    {task.creator_name && (
                        <p className="text-sm text-neutral-500">
                            Creado por: {task.creator_name}
                        </p>
                    )}
                </div>

                {/* Botón de completar */}
                {canEdit && (
                    <button
                        onClick={handleToggleCompleted}
                        title="Marcar como completado"
                        aria-label="Marcar como completado"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-6 h-6 ${task.completed ? 'text-green-500' : 'text-neutral-400'}`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ========== Descripción ========== */}
            <div
                className="text-neutral-700 mb-4 prose max-w-none dark:bg-[#2a2e33]"
                dangerouslySetInnerHTML={{ __html: task.description }}
            />

            {/* ========== Archivos adjuntos ========== */}
            {task.recurso && task.recurso.length > 0 && (
                <div className="mb-4">
                    <h3 className="font-semibold text-sm text-neutral-800 mb-1">Archivos adjuntos:</h3>
                    <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                        {task.recurso.map((file, index) => (
                            <li key={index}>
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline break-words"
                                >
                                    {file.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ========== Acciones ========== */}
            {(canEdit || canDelete) && (
                <div className="flex gap-2 flex-wrap mt-auto" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                        <button
                            className="px-4 py-2 rounded-md text-sm font-semibold bg-yellow-400 text-black hover:bg-yellow-500"
                            onClick={() => navigate(`/tasks/${taskId}/edit`)}
                        >
                            Editar
                        </button>
                    )}
                    {canDelete && (
                        <button
                            className="px-4 py-2 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : 'Borrar'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskCard;
