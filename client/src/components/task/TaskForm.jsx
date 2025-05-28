import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { message, ConfigProvider } from 'antd';
import esES from 'antd/es/locale/es_ES';
import dayjs from '../../utils/dayjsConfig';

import TitleInput from './form/TitleInput';
import DescriptionEditor from './form/DescriptionEditor';
import CreatorField from './form/CreatorField';
import CollaboratorsSection from './form/CollaboratorsSection';
import DatePickers from './form/DatePickers';
import StatusSelector from './form/StatusSelector';
import FormActions from './form/FormActions';

import { createTask, updateTask, deleteTask, fetchTask } from '../../api/tasks';

function TaskForm() {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        startDate: dayjs(), // Fecha de hoy por defecto
        deadline: null,
        status: 'Pendiente',
        collaborators: [],
        creator: '',
        creator_name: '',
    });

    const [noDeadline, setNoDeadline] = useState(false);
    const [newCollaborator, setNewCollaborator] = useState('');
    const [newPermission, setNewPermission] = useState('read');

    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get('projectId');

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userFullName = `${user.nombre || ''} ${user.apellidos || ''}`.trim();
    const userEmail = user.email || '';

    const handleChange = (field, value) => {
        console.log(`Cambiando ${field}:`, value?.format ? value.format('DD/MM/YYYY') : value);
        setTaskData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Preparar fechas para envío - mantener consistencia con formato ISO
        const prepareDate = (date) => {
            if (!date) return null;
            // Asegurarse de que sea un objeto dayjs válido
            const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
            return dayjsDate.format('YYYY-MM-DD'); // Formato simple para evitar problemas de zona horaria
        };

        const baseData = {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            collaborators: taskData.collaborators,
            startDate: prepareDate(taskData.startDate),
            deadline: noDeadline ? null : prepareDate(taskData.deadline),
        };

        const dataToSend = params.id
            ? { ...baseData, projectId } // Para actualización (PUT)
            : {
                ...baseData,               // Para creación (POST)
                projectId: projectId || null,
                creator: userEmail,
                creator_name: userFullName,
            };

        console.log('Datos a enviar:', dataToSend);

        try {
            if (params.id) {
                await updateTask(params.id, dataToSend);
                message.success('Tarea actualizada correctamente');
            } else {
                await createTask(dataToSend);
                message.success('Tarea creada correctamente');
            }
            navigate(`/proyectos?projectId=${projectId}`);
        } catch (err) {
            console.error('Error al guardar la tarea:', err.response?.data || err.message);
            message.error('Error al guardar la tarea');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTask(params.id);
            message.success('Tarea eliminada correctamente');
            navigate(`/proyectos?projectId=${projectId}`);
        } catch (err) {
            console.error(err);
            message.error('Error al eliminar la tarea');
        }
    };

    const addCollaborator = () => {
        if (!newCollaborator) return;
        const exists = taskData.collaborators.find((c) => c.email === newCollaborator);
        if (exists) {
            message.warning('Este colaborador ya está añadido');
            return;
        }
        setTaskData((prev) => ({
            ...prev,
            collaborators: [...prev.collaborators, { email: newCollaborator, permission: newPermission }],
        }));
        setNewCollaborator('');
        setNewPermission('read');
    };

    const removeCollaborator = (email) => {
        setTaskData((prev) => ({
            ...prev,
            collaborators: prev.collaborators.filter((c) => c.email !== email),
        }));
    };

    useEffect(() => {
        if (params.id) {
            fetchTask(params.id)
                .then((res) => {
                    console.log('Datos recibidos del backend:', res.data);

                    // Procesar fechas de forma consistente
                    const processDate = (dateValue) => {
                        if (!dateValue) return null;
                        return dayjs(dateValue);
                    };

                    setTaskData({
                        ...res.data,
                        startDate: processDate(res.data.startDate) || dayjs(), // Fallback a hoy si no hay fecha
                        deadline: processDate(res.data.deadline),
                        status: res.data.status || 'Pendiente',
                        collaborators: res.data.collaborators || [],
                        creator: res.data.creator || userEmail,
                        creator_name: res.data.creator_name || userFullName,
                    });

                    setNoDeadline(!res.data.deadline);

                    console.log('Fechas procesadas - Inicio:', processDate(res.data.startDate)?.format('DD/MM/YYYY'), 'Límite:', processDate(res.data.deadline)?.format('DD/MM/YYYY'));
                })
                .catch((err) => {
                    console.error('Error al cargar tarea:', err);
                    message.error('Error al cargar la tarea');
                });
        } else {
            // Tarea nueva - establecer valores por defecto
            setTaskData((prev) => ({
                ...prev,
                startDate: dayjs(), // Fecha de hoy por defecto
                creator: userEmail,
                creator_name: userFullName,
            }));
        }
    }, [params.id, userEmail, userFullName]);

    return (
        <ConfigProvider locale={esES}>
            <div className="flex items-start justify-center min-h-screen w-full bg-white dark:bg-[#1A1A1A] px-4 text-black dark:text-white">
                <div className="w-full max-w-4xl py-10">
                    <form
                        className="bg-white dark:bg-[#2a2e33] border border-gray-200 dark:border-[#FFFFFF] p-8 rounded-xl shadow-md space-y-6"
                        onSubmit={handleSubmit}
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold text-center">
                            {params.id ? 'ACTUALIZAR TAREA' : 'NUEVA TAREA'}
                        </h1>

                        <TitleInput value={taskData.title} onChange={(val) => handleChange('title', val)} />
                        <DescriptionEditor value={taskData.description} onChange={(val) => handleChange('description', val)} />
                        <CreatorField value={taskData.creator_name || 'Desconocido'} />

                        <CollaboratorsSection
                            collaborators={taskData.collaborators}
                            newCollaborator={newCollaborator}
                            newPermission={newPermission}
                            setNewCollaborator={setNewCollaborator}
                            setNewPermission={setNewPermission}
                            addCollaborator={addCollaborator}
                            removeCollaborator={removeCollaborator}
                            updatePermission={(email, perm) => {
                                const updated = taskData.collaborators.map((c) =>
                                    c.email === email ? { ...c, permission: perm } : c
                                );
                                setTaskData((prev) => ({ ...prev, collaborators: updated }));
                            }}
                        />

                        <DatePickers
                            startDate={taskData.startDate}
                            deadline={taskData.deadline}
                            noDeadline={noDeadline}
                            onChange={handleChange}
                            setNoDeadline={setNoDeadline}
                        />

                        <StatusSelector value={taskData.status} onChange={(val) => handleChange('status', val)} />

                        <FormActions
                            isEditing={!!params.id}
                            onCancel={() => navigate(`/proyectos?projectId=${projectId}`)}
                            onDelete={handleDelete}
                        />
                    </form>
                </div>
            </div>
        </ConfigProvider>
    );
}

export default TaskForm;