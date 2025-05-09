import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createTask, deleteTask, fetchTask, updateTask } from '../../api/tasks'

function TaskForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const params = useParams()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (!params.id) {
                await createTask({ title, description })
            } else {
                await updateTask(params.id, { title, description })
            }
            navigate('/dashboard')
        } catch (error) {
            console.error(error)
        }
        e.target.reset()
    }

    useEffect(() => {
        if (params.id) {
            fetchTask(params.id)
                .then((res) => {
                    setTitle(res.data.title)
                    setDescription(res.data.description)
                })
                .catch((err) => console.log(err))
        }
    }, [])

    return (
        <div className="flex items-top justify-center min-h-screen w-full bg-white px-4">
            <div className="w-full max-w-2xl py-10">
                <form
                    className="bg-white border border-neutral-200 p-8 rounded-xl shadow-md"
                    onSubmit={handleSubmit}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-neutral-900 text-center">
                        {params.id ? 'Actualizar Tarea' : 'Crear Tarea'}
                    </h1>
                    <input
                        type="text"
                        placeholder="Título"
                        className="block py-3 px-4 mb-6 w-full bg-neutral-100 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        autoFocus
                    />
                    <textarea
                        placeholder="Descripción"
                        rows={5}
                        className="block py-3 px-4 mb-6 w-full bg-neutral-100 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    ></textarea>
                    <button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition duration-300"
                    >
                        {params.id ? 'Actualizar Tarea' : 'Crear Tarea'}
                    </button>
                </form>
                {params.id && (
                    <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg mt-6 transition duration-300"
                        onClick={async () => {
                            try {
                                await deleteTask(params.id)
                                navigate('/dashboard')
                            } catch (error) {
                                console.error(error)
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
