import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    DatePicker,
    Input,
    Select,
    Button,
    Popconfirm,
    message,
    Checkbox,
    ConfigProvider
} from 'antd';
import { createTask, updateTask, deleteTask, fetchTask } from '../../api/tasks';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import esES from 'antd/es/locale/es_ES';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

const { Option } = Select;

function TaskForm() {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        creator: '',
        startDate: dayjs(),
        deadline: null,
        status: 'Pendiente',
    });

    const [noDeadline, setNoDeadline] = useState(false);

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
                deadline: noDeadline ? null : (taskData.deadline ? dayjs(taskData.deadline).toISOString() : null),
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
                        startDate: res.data.startDate ? dayjs(res.data.startDate) : dayjs(),
                        deadline: res.data.deadline ? dayjs(res.data.deadline) : null,
                        status: res.data.status || 'Pendiente',
                    });
                    setNoDeadline(!res.data.deadline);
                })
                .catch((err) => console.log(err));
        }
    }, [params.id]);

    return (
        <ConfigProvider locale={esES}>
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

                        {/* Editor enriquecido para la descripción */}
                        <div className="bg-white rounded text-black">
                            <ReactQuill
                                theme="snow"
                                value={taskData.description}
                                onChange={(value) => handleChange('description', value)}
                                placeholder="Descripción de la tarea..."
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ['bold', 'italic', 'underline'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['clean'],
                                    ],
                                }}
                            />
                        </div>

                        <Input
                            placeholder="Creador"
                            value={taskData.creator}
                            onChange={(e) => handleChange('creator', e.target.value)}
                        />

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-4">
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Fecha de inicio"
                                    value={taskData.startDate}
                                    onChange={(date) => handleChange('startDate', date)}
                                    format="DD/MM/YYYY"
                                    locale={esES}
                                />
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Fecha límite"
                                    value={noDeadline ? null : taskData.deadline}
                                    onChange={(date) => handleChange('deadline', date)}
                                    disabled={noDeadline}
                                    format="DD/MM/YYYY"
                                    locale={esES}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Checkbox
                                    className="text-white"
                                    checked={noDeadline}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setNoDeadline(checked);
                                        if (checked) handleChange('deadline', null);
                                    }}
                                >
                                    Sin fecha límite.
                                </Checkbox>
                            </div>
                        </div>

                        <Select
                            value={taskData.status}
                            onChange={(value) => handleChange('status', value)}
                            className="w-full"
                        >
                            <Option value="Pendiente">Pendiente</Option>
                            <Option value="En proceso">En proceso</Option>
                            <Option value="Completado">Completado</Option>
                        </Select>

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
        </ConfigProvider>
    );
}

export default TaskForm;
