import { useNavigate } from 'react-router-dom';
import { deleteTask, updateTask } from '../../api/tasks';
import { useState } from 'react';

function TaskCard({ task, onTaskChanged }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleToggleCompleted = async (e) => {
        e.stopPropagation();
        try {
            setLoading(true);
            const res = await updateTask(task._id, { completed: !task.completed });
            if (res.status === 200 && onTaskChanged) {
                onTaskChanged();
            }
        } catch (err) {
            console.error('Error al actualizar tarea:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
            try {
                await deleteTask(task._id);
                if (onTaskChanged) onTaskChanged();
            } catch (err) {
                console.error('Error al eliminar tarea:', err);
            }
        }
    };

    return (
        <div
            className="flex flex-col p-6 rounded-xl shadow-md border border-neutral-200 bg-white text-black transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={() => navigate(`/tasks/${task._id}`)}
        >
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h2 className="font-bold text-xl break-words whitespace-normal">
                        {task.title}
                    </h2>
                    {task.creator_name && (
                        <p className="text-sm text-neutral-500">Creado por: {task.creator_name}</p>
                    )}
                </div>
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
            </div>

            {/* Descripción */}
            <div
                className="text-neutral-700 mb-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: task.description }}
            />

            {/* Acciones */}
            <div className="flex gap-2 flex-wrap mt-auto" onClick={(e) => e.stopPropagation()}>
                <button
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-yellow-400 text-black hover:bg-yellow-500"
                    onClick={() => navigate(`/tasks/${task._id}/edit`)}
                >
                    Editar
                </button>
                <button
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? 'Eliminando...' : 'Borrar'}
                </button>
            </div>
        </div>
    );
}

export default TaskCard;
