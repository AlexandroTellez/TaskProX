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

function TaskCard({ task }) {
    const navigate = useNavigate()
    return (
        <div className="bg-zinc-950 p-4 hover:cursor-pointer hover:bg-gray-950"
            onClick={() =>  {navigate(`/tasks/${task._id}`)
            }}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
        </div>
    );
}

export default TaskCard;