/**
 * TaskList component renders a list of tasks in a grid layout.
 *
 * @component
 * @param {Object[]} tasks - Array of task objects to be displayed.
 * @param {string} tasks[].id - Unique identifier for the task.
 * @param {string} tasks[].title - Title of the task.
 * @param {string} tasks[].description - Description of the task.
 * @returns {JSX.Element} A grid layout containing TaskCard components for each task.
 */
import TaskCard from '../components/TaskCard'
function TaskList({ tasks }) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {
                tasks.map(task => (
                    <TaskCard task={task} key={task._id} />
                ))
            }
        </div>
    )
}

export default TaskList