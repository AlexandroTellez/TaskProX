import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createTask, deleteTask, fetchTask, updateTask } from '../../api/tasks';
import { DatePicker, Input, Select, Slider, Button, Popconfirm, message } from 'antd';
import dayjs from 'dayjs';

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
                projectId: projectId || null,
                startDate: taskData.startDate ? dayjs(taskData.startDate).toISOString() : null,
                deadline: taskData.deadline ? dayjs(taskData.deadline).toISOString() : null,
            };

            if (!params.id) {
                await createTask(dataToSend);
            } else {
                await updateTask(params.id, dataToSend);
            }

            navigate(`/proyectos?projectId=${projectId}`);
        } catch (error) {
            console.error(error);
            message.error('Error al guardar la tarea');
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchTask(params.id)
                .then((res) => {
                    setTaskData({
                        ...res.data,
                        startDate: res.data.startDate ? dayjs(res.data.startDate) : null,
                        deadline: res.data.deadline ? dayjs(res.data.deadline) : null,
                    });
                })
                .catch((err) => console.log(err));
        }
    }, [params.id]);

    return (
        <div className="flex items-start justify-center min-h-screen w-full bg-white px-4">
            <div className="w-full max-w-2xl py-10">
                <form
                    className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-md space-y-6 text-white"
                    onSubmit={handleSubmit}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-center">
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
                            value={taskData.startDate}
                            onChange={(date) => handleChange('startDate', date)}
                        />
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Fecha límite"
                            value={taskData.deadline}
                            onChange={(date) => handleChange('deadline', date)}
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
                            trackStyle={{ backgroundColor: '#FED36A' }}
                            handleStyle={{
                                borderColor: '#FED36A',
                                backgroundColor: '#FED36A',
                            }}
                        />

                    </div>

                    <Button
                        htmlType="submit"
                        block
                        style={{
                            backgroundColor: '#FED36A',
                            borderColor: '#FED36A',
                            color: '#FFFFFF',
                            fontWeight: 'semibold',
                        }}
                    >
                        {params.id ? 'Actualizar Tarea' : 'Crear Tarea'}
                    </Button>
                </form>

                {params.id && (
                    <Popconfirm
                        title="¿Seguro que deseas eliminar esta tarea?"
                        onConfirm={async () => {
                            try {
                                await deleteTask(params.id);
                                navigate(`/proyectos?projectId=${projectId}`);
                            } catch (error) {
                                console.error(error);
                                message.error('Error al eliminar la tarea');
                            }
                        }}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            danger
                            block
                            className="mt-6"
                            style={{
                                fontWeight: 'bold',
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                color: 'white',
                            }}
                        >
                            Borrar Tarea
                        </Button>
                    </Popconfirm>
                )}
            </div>
        </div>
    );
}

export default TaskForm;
