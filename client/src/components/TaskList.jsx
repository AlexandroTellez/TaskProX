import { useNavigate } from 'react-router-dom'
import TaskCard from './TaskCard'

function TaskList({ tasks }) {
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Botón para crear nueva tarea */}
            <button
                onClick={() => navigate('/tasks/new')}
                className="self-start bg-yellow-600 hover:bg-neutral-400 text-black font-semibold py-2 px-4 rounded-md"
            >
                Crear Nueva Tarea
            </button>

            {/* Lista de tareas en diseño responsive */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                {
                    tasks.map(task => (
                        <TaskCard task={task} key={task._id} />
                    ))
                }
            </div>
        </div>
    )
}

export default TaskList
