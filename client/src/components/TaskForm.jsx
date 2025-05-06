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
        <div className="flex items-top justify-center min-h-screen w-full">
            <div className="w-full max-w-2xl p-8">
                <form className="bg-white/5 backdrop-blur-md p-8 rounded-xl shadow-md" onSubmit={handleSubmit}>
                    <h1 className="text-4xl font-bold mb-6 text-center">
                        {params.id ? "Actualizar Tarea" : "Crear Tarea"}
                    </h1>
                    <input
                        type="text"
                        placeholder="Título"
                        className="block py-3 px-4 mb-6 w-full bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        autoFocus
                    />
                    <textarea
                        placeholder="Descripción"
                        rows={5}
                        className="block py-3 px-4 mb-6 w-full bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    ></textarea>
                    <button
                        className="w-full bg-yellow-600 text-neutral-900 hover:text-slate-100 font-bold py-3 rounded-lg transition duration-300"
                    >
                        {params.id ? "Actualizar Tarea" : "Crear Tarea"}
                    </button>
                </form>
                {params.id && (
                    <button
                        className="w-full  bg-neutral-900 text-yellow-600 hover:text-slate-100 font-bold py-3 rounded-lg mt-6 transition duration-300"
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
                        Borrar
                    </button>
                )}
            </div>
        </div>
    )
}

export default TaskForm
