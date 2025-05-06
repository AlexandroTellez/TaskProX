import { useNavigate } from 'react-router-dom'
import { updateTask, deleteTask } from '../api/tasks'

function TaskCard({ task }) {
    const navigate = useNavigate();

    const cardClasses = `
        flex flex-col p-6 backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 cursor-pointer
        hover:scale-105
        ${task.completed
            ? 'bg-green-400/10 border border-green-400/30'
            : 'bg-white/10 border border-white/20'}
    `;

    const buttonClasses = `
        px-3 py-1 rounded-md text-sm font-semibold transition-colors
        hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
            await deleteTask(id);
            window.location.reload(); // Refreshes the list after deleting
        }
    };

    return (
        <div
            className={cardClasses}
            onClick={() => navigate(`/tasks/${task._id}`)}
        >
            <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-2xl text-neutral-100">{task.title}</h2>
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
                        className={`size-6 ${task.completed ? 'text-green-300' : 'text-neutral-200'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
            </div>

            <p className="text-neutral-300 mb-4">{task.description}</p>

            <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                <button
                    className={`${buttonClasses} bg-yellow-600 text-neutral-900 font-medium`}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/${task._id}`);
                    }}
                >
                    Editar
                </button>
                <button
                    className={`${buttonClasses} bg-neutral-900 text-yellow-600 font-medium`}
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
