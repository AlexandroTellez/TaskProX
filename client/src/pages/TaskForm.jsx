/**
 * TaskForm component allows users to create or update a task.
 *
 * This component uses React hooks for state management and side effects.
 * It utilizes `useState` to manage the title and description of the task,
 * and `useEffect` to fetch task data if an `id` parameter is present in the URL.
 *
 * The form submission is handled by `handleSubmit` function which sends a POST request
 * to the server to create a new task. If an `id` is present, it fetches the task data
 * and populates the form fields for updating.
 *
 * @component
 * @example
 * return (
 *   <TaskForm />
 * )
 *
 * @returns {JSX.Element} The rendered TaskForm component.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

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
                const res = await axios.post('http://localhost:8000/api/tasks', {
                    title,
                    description
                });
                console.log(res);
            } else {
                // If there is an id in the URL parameters, update the existing task
                const res = await axios.put(`http://localhost:8000/api/tasks/${params.id}`, {
                    title,
                    description
                })
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
            fetchTask()
        }

        async function fetchTask() {
            const res = await axios.get(`http://localhost:8000/api/tasks/${params.id}`);
            setTitle(res.data.title);
            setDescription(res.data.description);
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <div>
                <form className="bg-zinc-950 p-10" onSubmit={handleSubmit}>
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
                    <button>
                        {params.id ? "Update Task" : "Create Task"}
                    </button>
                </form>
                {params.id && (
                    <button
                        className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded mt-4"
                        onClick={async () => {
                            try {
                                const res = await axios.delete(`http://localhost:8000/api/tasks/${params.id}`);
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