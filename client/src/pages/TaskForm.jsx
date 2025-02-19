/**
 * TaskForm component allows users to create, update, and delete tasks.
 *
 * This component uses React hooks to manage state and side effects.
 * It interacts with a backend API to perform CRUD operations on tasks.
 *
 * @component
 * @example
 * return (
 *   <TaskForm />
 * )
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @function
 * @name TaskForm
 *
 * @description
 * - `useState` hooks are used to manage the title and description of the task.
 * - `useParams` hook is used to get the task ID from the URL parameters.
 * - `useNavigate` hook is used to navigate programmatically.
 * - `handleSubmit` function handles form submission to create or update a task.
 * - `useEffect` hook is used to fetch the task data if an ID is present in the URL parameters.
 *
 * @async
 * @function
 * @name handleSubmit
 * @param {Object} e - The event object.
 * @description Handles form submission to create or update a task.
 *
 * @async
 * @function
 * @name fetchTask
 * @description Fetches the task data from the API if an ID is present in the URL parameters.
 *
 * @function
 * @name handleDelete
 * @description Handles the deletion of a task if an ID is present in the URL parameters.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchTask, createTask, updateTask, deleteTask } from '../api/tasks'

function TaskForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const params = useParams()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // If there is no id in the URL parameters, create a new task
            if (!params.id) {
                const res = await createTask({ title, description })
                console.log(res);
            } else {
                const res = await updateTask(params.id, { title, description })
                console.log(res);
            }
            navigate('/');
        } catch (error) {
            console.error(error);
        }

        e.target.reset();

    }

    useEffect(() => {
        if (params.id) {
            fetchTask(params.id)
                .then((res) => {
                    setTitle(res.data.title);
                    setDescription(res.data.description);
                })
                .catch((err) => console.log(err));
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <div>
                <form className="bg-zinc-950 p-10" onSubmit={handleSubmit}>
                    <h1
                        className="text-3xl font-bold my-4">
                        {params.id ? "Update Task" : "Create Task"}
                    </h1>
                    <input
                        type="text"
                        placeholder="title"
                        className="block py-2 px-3 mb-4 w-full text-black"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        autoFocus
                    />
                    <textarea
                        placeholder="description"
                        rows={3}
                        className="block py-2 px-3 mb-4 w-full text-black"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    ></textarea>
                    <button
                        className="bg-white hover:bg-slate-800 hover:text-white text-slate-800 font-bold py-2 px-4 rounded"
                    >
                        {params.id ? "Update Task" : "Create Task"}
                    </button>
                </form>
                {params.id && (
                    <button
                        className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded mt-4"
                        onClick={async () => {
                            try {
                                const res = await deleteTask(params.id);
                                console.log(res);
                                navigate('/');
                            } catch (error) {
                                console.error(error);
                            }
                        }}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
}

export default TaskForm