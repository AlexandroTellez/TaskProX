import { useNavigate } from 'react-router-dom';
import TaskCard from './TaskCard';

function TaskList({ tasks }) {
    const navigate = useNavigate();

    return (
        <div className="w-full px-4 sm:px-10 py-8 bg-white min-h-screen">
            {/* Botón para crear nueva tarea */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/tasks/new')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                    Crear Nueva Tarea
                </button>
            </div>

            {/* Lista de tareas */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tasks.map(task => (
                    <TaskCard task={task} key={task._id} />
                ))}
            </div>
        </div>
    )
}

export default TaskList
