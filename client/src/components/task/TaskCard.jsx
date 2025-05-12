import { useNavigate } from 'react-router-dom';
import { deleteTask, updateTask } from '../../api/tasks';

function TaskCard({ task }) {
    const navigate = useNavigate();

    const cardClasses = `
        flex flex-col p-6 rounded-xl shadow-md transition-all duration-300 cursor-pointer
        hover:scale-105 border bg-white border-neutral-200 text-black
    `;

    const buttonClasses = `
        px-4 py-2 rounded-md text-sm font-semibold transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
            await deleteTask(id);
            window.location.reload();
        }
    };

    return (
        <div className={cardClasses} onClick={() => navigate(`/tasks/${task._id}`)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="font-bold text-xl">{task.title}</h2>
                    {task.creator_name && (
                        <p className="text-sm text-neutral-500">Creado por: {task.creator_name}</p>
                    )}
                </div>
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        const res = await updateTask(task._id, { completed: !task.completed });
                        if (res.status === 200) {
                            window.location.reload();
                        }
                    }}
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

            {/* Mostrar HTML enriquecido */}
            <div
                className="text-neutral-700 mb-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: task.description }}
            />

            <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                <button
                    className={`${buttonClasses} bg-yellow-400 text-black hover:bg-yellow-500`}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/${task._id}`);
                    }}
                >
                    Editar
                </button>
                <button
                    className={`${buttonClasses} bg-red-500 text-white hover:bg-red-600 `}
                    onClick={async (e) => {
                        e.stopPropagation();
                        await handleDelete(task._id);
                    }}
                >
                    Borrar
                </button>
            </div>
        </div>
    );
}

export default TaskCard;
