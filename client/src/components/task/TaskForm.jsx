import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createTask, deleteTask, fetchTask, updateTask } from '../../api/tasks';
import { DatePicker, Input, Select, Slider } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

function TaskForm() {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        creator: '',
        startDate: null,
        deadline: null,
        status: 'Pendiente',
        progress: 0,
    });

    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get("projectId");

    const handleChange = (field, value) => {
        setTaskData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...taskData,
                projectId,
            };

            if (!params.id) {
                await createTask(dataToSend);
            } else {
                await updateTask(params.id, dataToSend);
            }

            navigate(`/proyectos`);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchTask(params.id)
                .then((res) => {
                    setTaskData(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, []);

    return (
        <div className="flex items-start justify-center min-h-screen w-full bg-white px-4">
            <div className="w-full max-w-2xl py-10">
                <form
                    className="bg-white border border-neutral-200 p-8 rounded-xl shadow-md space-y-6"
                    onSubmit={handleSubmit}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-center text-neutral-900">
                        {params.id ? 'Actualizar Tarea' : 'Crear Tarea'}
                    </h1>

                    <Input
                        placeholder="Título"
                        value={taskData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        size="large"
                    />

                    <TextArea
                        placeholder="Descripción"
                        rows={4}
                        value={taskData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />

                    <Input
                        placeholder="Creador"
                        value={taskData.creator}
                        onChange={(e) => handleChange('creator', e.target.value)}
                    />

                    <div className="flex gap-4">
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Fecha de inicio"
                            value={taskData.startDate ? dayjs(taskData.startDate) : null}
                            onChange={(date, dateString) => handleChange('startDate', dateString)}
                        />
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Fecha límite"
                            value={taskData.deadline ? dayjs(taskData.deadline) : null}
                            onChange={(date, dateString) => handleChange('deadline', dateString)}
                        />
                    </div>

                    <Select
                        value={taskData.status}
                        onChange={(value) => handleChange('status', value)}
                        className="w-full"
                    >
                        <Option value="Pendiente">Pendiente</Option>
                        <Option value="En proceso">En proceso</Option>
                        <Option value="Completado">Completado</Option>
                        <Option value="At risk">En riesgo</Option>
                    </Select>

                    <div>
                        <label className="font-medium block mb-1">Progreso: {taskData.progress}%</label>
                        <Slider
                            value={taskData.progress}
                            onChange={(value) => handleChange('progress', value)}
                        />
                    </div>

                    <button
                        type="submit"
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
                                await deleteTask(params.id);
                                navigate('/proyectos');
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
    );
}

export default TaskForm;
