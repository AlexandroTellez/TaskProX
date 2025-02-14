/**
 * TaskList component renders a list of tasks in a grid layout.
 *
 * @component
 * @param {Object[]} tasks - Array of task objects to be displayed.
 * @param {string} tasks._id - Unique identifier for the task.
 * @param {string} tasks.title - Title of the task.
 * @param {string} tasks.description - Description of the task.
 *
 * @example
 * const tasks = [
 *   { _id: '1', title: 'Task 1', description: 'Description 1' },
 *   { _id: '2', title: 'Task 2', description: 'Description 2' }
 * ];
 * <TaskList tasks={tasks} />
 */
function TaskList({tasks}) {
    return (
        <div className="grid grid-cols-3 gap-4">
        {
            tasks.map(task => (
                <div key={task._id} className="bg-zinc-950 p-4 hover:cursor-pointer hover:bg-gray-950">
                    <h2>{task.title}</h2>
                    <p>{task.description}</p>
                </div>
            ))
        }
        </div>
    )
}

export default TaskList