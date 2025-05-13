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
    ConfigProvider,
    Space
} from 'antd';
import { createTask, updateTask, deleteTask, fetchTask } from '../../api/tasks';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import esES from 'antd/es/locale/es_ES';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    EyeOutlined,
    EditOutlined,
    ToolOutlined
} from '@ant-design/icons';

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

const user = JSON.parse(localStorage.getItem('user'));
const userFullName = `${user?.nombre || ''} ${user?.apellidos || ''}`.trim();

const { Option } = Select;

function TaskForm() {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        startDate: dayjs(),
        deadline: null,
        status: 'Pendiente',
        collaborators: []
    });

    const [noDeadline, setNoDeadline] = useState(false);
    const [newCollaborator, setNewCollaborator] = useState('');
    const [newPermission, setNewPermission] = useState('read');

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

    const addCollaborator = () => {
        if (!newCollaborator) return;
        const exists = taskData.collaborators.find(c => c.email === newCollaborator);
        if (exists) {
            message.warning('Este colaborador ya está añadido');
            return;
        }
        setTaskData((prev) => ({
            ...prev,
            collaborators: [...prev.collaborators, { email: newCollaborator, permission: newPermission }]
        }));
        setNewCollaborator('');
        setNewPermission('read');
    };

    const removeCollaborator = (email) => {
        setTaskData((prev) => ({
            ...prev,
            collaborators: prev.collaborators.filter((c) => c.email !== email)
        }));
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
                        collaborators: res.data.collaborators || [],
                        creator_name: res.data.creator_name || userFullName
                    });
                    setNoDeadline(!res.data.deadline);
                })
                .catch((err) => console.log(err));
        } else {
            // Al crear tarea, guardar el nombre del usuario
            setTaskData((prev) => ({ ...prev, creator_name: userFullName }));
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

                        {/* Título */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Título</h2>
                            <Input.TextArea
                                placeholder="Título"
                                value={taskData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                className="break-words whitespace-normal resize-none"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Descripción</h2>
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
                        </div>

                        {/* Creador */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Creador</h2>
                            <Input
                                value={taskData.creator_name || 'Desconocido'}
                                readOnly
                                className="bg-neutral-800 text-white border border-gray-600 pointer-events-none focus:outline-none focus:ring-0 focus:border-transparent"
                            />
                        </div>
                        {/* Colaboradores */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Colaboradores</h2>

                            <div className="flex flex-col gap-2">
                                <Input
                                    placeholder="Correo del colaborador"
                                    value={newCollaborator}
                                    onChange={(e) => setNewCollaborator(e.target.value)}
                                />

                                <div className="flex gap-2 items-center">
                                    <Select
                                        value={newPermission}
                                        onChange={(val) => setNewPermission(val)}
                                        className="flex-1"
                                        dropdownStyle={{ zIndex: 1300 }}
                                    >
                                        <Option value="read">
                                            <EyeOutlined className="mr-1" /> Ver
                                        </Option>
                                        <Option value="write">
                                            <EditOutlined className="mr-1" /> Ver y editar
                                        </Option>
                                        <Option value="admin">
                                            <ToolOutlined className="mr-1" /> Administrador
                                        </Option>
                                    </Select>
                                    <Button
                                        onClick={addCollaborator}
                                        style={{
                                            backgroundColor: '#FED36A',
                                            borderColor: '#FED36A',
                                            color: '#1A1A1A',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Añadir
                                    </Button>
                                </div>
                            </div>

                            {taskData.collaborators.length === 0 ? (
                                <div className="bg-neutral-800 text-white px-4 py-2 rounded text-center text-sm border border-neutral-600 mt-2">
                                    Sin colaboradores asignados
                                </div>
                            ) : (
                                <ul className="mt-2 space-y-2">
                                    {taskData.collaborators.map((col, idx) => (
                                        <li
                                            key={idx}
                                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-neutral-800 p-2 rounded gap-2"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                                <span className="text-white">{col.email}</span>
                                                <Select
                                                    value={col.permission}
                                                    onChange={(newPerm) => {
                                                        const updated = taskData.collaborators.map((c) =>
                                                            c.email === col.email ? { ...c, permission: newPerm } : c
                                                        );
                                                        setTaskData((prev) => ({ ...prev, collaborators: updated }));
                                                    }}
                                                    className="flex-1 sm:w-48"
                                                    dropdownStyle={{ zIndex: 1300 }}
                                                >
                                                    <Option value="read">
                                                        <EyeOutlined className="mr-1" /> Ver
                                                    </Option>
                                                    <Option value="write">
                                                        <EditOutlined className="mr-1" /> Ver y editar
                                                    </Option>
                                                    <Option value="admin">
                                                        <ToolOutlined className="mr-1" /> Administrador
                                                    </Option>
                                                </Select>
                                            </div>
                                            <Button
                                                danger
                                                size="small"
                                                onClick={() => removeCollaborator(col.email)}
                                                className="self-end sm:self-auto"
                                                style={{
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Eliminar
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Fechas */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Fechas</h2>
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
                        </div>

                        {/* Estado */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Estado</h2>
                            <Select
                                value={taskData.status}
                                onChange={(value) => handleChange('status', value)}
                                className="w-full"
                            >
                                <Option value="Pendiente">Pendiente</Option>
                                <Option value="En proceso">En proceso</Option>
                                <Option value="Completado">Completado</Option>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-4">

                            <Button
                                htmlType="submit"
                                block
                                style={{
                                    backgroundColor: '#FED36A',
                                    borderColor: '#FED36A',
                                    color: '#1A1A1A',
                                    fontWeight: 'bold',
                                }}
                            >
                                {params.id ? 'Actualizar Tarea' : 'Crear Tarea'}
                            </Button>
                            <Button
                                type="default"
                                onClick={() => navigate(`/proyectos?projectId=${projectId}`)}
                                block
                                style={{
                                    backgroundColor: 'white',
                                    color: 'black',
                                    border: '1px solid #D1D5DB', // gray-300
                                    fontWeight: 'bold',
                                }}
                            >
                                Cancelar
                            </Button>

                        </div>
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
