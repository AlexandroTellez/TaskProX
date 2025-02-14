/**
 * TaskForm component allows users to create a new task by submitting a form.
 * It uses React's useState hook to manage the state of the form inputs.
 *
 * @component
 * @example
 * return (
 *   <TaskForm />
 * )
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @function handleSubmit
 * Handles the form submission, sends a POST request to the server with the task data,
 * and resets the form.
 *
 * @param {Object} e - The event object.
 *
 * @function setTitle
 * Updates the state of the title input.
 *
 * @param {Object} e - The event object.
 *
 * @function setDescription
 * Updates the state of the description input.
 *
 * @param {Object} e - The event object.
 */
import { useState } from 'react'
import axios from 'axios'

function TaskForm(){
    const[title, setTitle] = useState('')
    const[description, setDescription] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await axios.post('http://localhost:8000/api/tasks', {
            title,
            description
        })

        console.log(res)

        e.target.reset();
    }
    return (
        <div className= "flex items-center justify-center h-[calc(100vh-10rem)]">
            <form className="bg-zinc-950 p-10" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="title"
                    className="block py-2 px-3 mb-4 w-full text-black"
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                />
                <textarea
                placeholder="description"
                rows={3}
                className="block py-2 px-3 mb-4 w-full text-black"
                onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <button>save</button>
            </form>
        </div>
    )
}

export default TaskForm