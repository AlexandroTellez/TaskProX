/**
 * TaskCard component renders a card with task details and navigates to the task's detail page on click.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {Object} props.task - The task object containing task details.
 * @param {string} props.task._id - The unique identifier of the task.
 * @param {string} props.task.title - The title of the task.
 * @param {string} props.task.description - The description of the task.
 *
 * @example
 * const task = { _id: '1', title: 'Sample Task', description: 'This is a sample task description' };
 * <TaskCard task={task} />
 */
import { useNavigate } from 'react-router-dom'
import { updateTask } from '../api/tasks'

function TaskCard({ task }) {
    const navigate = useNavigate()
    return (
        <div className="bg-zinc-950 p-4 hover:cursor-pointer hover:bg-gray-950"
            onClick={() => {
                navigate(`/tasks/${task._id}`)
            }}>
            <div className='justify-between flex'>
                <h2 className='font-bold text-2xl'>{task.title}</h2>
                <button
                    onClick={async (e) => {
                        e.stopPropagation()
                        const res = await updateTask(task._id, { completed: !task.completed })
                        if (res.status === 200) {
                            window.location.reload()
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                        className={`size-6 ${task.completed ? 'text-green-300' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
            </div>
            <p className='text-slate-300'>{task.description}</p>
        </div>
    );
}

export default TaskCard;