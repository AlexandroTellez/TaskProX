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
import FileUploader from './form/FileUploader';

import { createTask, updateTask, deleteTask, fetchTask } from '../../api/tasks';
import { getPermission } from './list/utils';

function TaskForm() {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        startDate: dayjs(),
        deadline: null,
        status: 'Pendiente',
        collaborators: [],
        creator: '',
        creator_name: '',
        recurso: [],
    });

    const [noDeadline, setNoDeadline] = useState(false);
    const [newCollaborator, setNewCollaborator] = useState('');
    const [newPermission, setNewPermission] = useState('read');
    const [permission, setPermission] = useState('none');

    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const rawProjectId = queryParams.get('projectId');
    const projectId = (!rawProjectId || rawProjectId === 'undefined' || rawProjectId === 'null') ? null : rawProjectId;

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userFullName = `${user.nombre || ''} ${user.apellidos || ''}`.trim();
    const userEmail = user.email || '';

    const handleChange = (field, value) => {
        setTaskData((prev) => ({ ...prev, [field]: value }));
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ===================== Validación: título obligatorio =====================
        if (!taskData.title.trim()) {
            message.warning("El título de la tarea es obligatorio.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // ===================== Validación: deadline posterior a startDate =====================
        if (!noDeadline && taskData.deadline && dayjs(taskData.deadline).isBefore(taskData.startDate)) {
            message.error("La fecha límite no puede ser anterior a la fecha de inicio.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // ===================== Validación: permisos de edición =====================
        if (params.id && permission !== 'write' && permission !== 'admin') {
            message.error('No tienes permiso para editar esta tarea.');
            return;
        }

        // ===================== Conversión segura de fechas =====================
        const prepareDate = (date) => {
            if (!date) return null;
            const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
            return dayjsDate.format('YYYY-MM-DD');
        };

        // ===================== Filtrar archivos nuevos y existentes =====================
        const nuevosArchivos = (taskData.recurso || []).filter(file => file instanceof File);
        const archivosExistentes = (taskData.recurso || []).filter(file => !(file instanceof File));

        // ===================== Validación: archivos con nombres no permitidos =====================
        const archivosInvalidos = nuevosArchivos.filter(file => file.name.startsWith('.'));
        if (archivosInvalidos.length > 0) {
            message.warning('Algunos archivos tienen nombres que comienzan con "." y serán renombrados automáticamente al descargarlos.');
        }

        // ===================== Defensa contra valores undefined o corruptos =====================
        const safeDescription = typeof taskData.description === 'string' ? taskData.description : '';
        const safeCollaborators = Array.isArray(taskData.collaborators) ? taskData.collaborators : [];
        const safeRecurso = Array.isArray(archivosExistentes) ? archivosExistentes : [];


        // ===================== Construcción del objeto base =====================
        const baseData = {
            title: taskData.title,
            description: safeDescription,
            status: taskData.status,
            collaborators: safeCollaborators,
            startDate: prepareDate(taskData.startDate),
            deadline: noDeadline ? null : prepareDate(taskData.deadline),
            recurso: safeRecurso,
        };

        const validId = params.id && params.id !== 'undefined' && params.id !== 'null' && params.id !== '';
        const id = validId ? params.id : taskData._id || taskData.id;
        const taskProjectId = taskData.projectId || projectId || null;

        // ===================== Preparar datos completos para enviar =====================
        const dataToSend = id
            ? { ...baseData, projectId: taskProjectId }
            : {
                ...baseData,
                projectId: taskProjectId,
                creator: userEmail,
                creator_name: userFullName,
            };

        // ===================== DEBUG: Verificar estructura antes de enviar =====================
        if (import.meta.env.DEV) {
            console.log('[DEBUG] dataToSend:', dataToSend);
            console.log('[DEBUG] nuevosArchivos:', nuevosArchivos);
            try {
                const testStringify = JSON.stringify(dataToSend);
                console.log('[DEBUG] JSON.stringify(dataToSend) válido:', testStringify);
            } catch (err) {
                console.error('[ERROR serializando dataToSend]:', err);
            }
        }

        // ===================== Envío de la tarea =====================
        try {
            setLoading(true);

            await (id
                ? updateTask(id, dataToSend, nuevosArchivos)
                : createTask(dataToSend, nuevosArchivos)
            );

            if (!id) setPermission('admin');

            message.success(id ? "Tarea actualizada correctamente" : "Tarea creada correctamente");
            navigate(`/proyectos?projectId=${projectId}`);
        } catch (err) {
            console.error('[ERROR AL GUARDAR TAREA]', err);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const backendError = err?.response?.data?.detail;
            if (typeof backendError === 'string') {
                if (backendError.includes('excede los') || backendError.includes('supera los')) {
                    message.error(`❌ Error: ${backendError}`);
                } else if (backendError.includes('15MB')) {
                    message.error('❌ El peso total de los archivos supera el límite de 15MB.');
                } else {
                    message.error(`⚠️ ${backendError}`);
                }
            } else if (err?.message?.includes('Network Error')) {
                message.error('⚠️ Error de red al guardar la tarea.');
            } else if (err?.code === 'ERR_NETWORK') {
                message.error('❌ No se pudo conectar con el servidor.');
            } else {
                message.error(`❌ Error inesperado al guardar la tarea.`);
            }
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async () => {
        if (permission !== 'admin') {
            message.error('No tienes permiso para eliminar esta tarea.');
            return;
        }

        try {
            const validId = params.id && params.id !== 'undefined' && params.id !== 'null' && params.id !== '';
            const id = validId ? params.id : taskData._id || taskData.id;

            if (!id) {
                message.error('ID inválido para eliminar tarea');
                return;
            }

            await deleteTask(id);
            message.success('Tarea eliminada correctamente');
            navigate(`/proyectos?projectId=${projectId}`);
        } catch (err) {
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

    const removeCollaborator = (id) => {
        setTaskData((prev) => ({
            ...prev,
            collaborators: prev.collaborators.filter((c) => {
                const identifier = c._id || c.id || c.email;
                return identifier !== id;
            }),
        }));
    };

    useEffect(() => {
        const validId = params.id && params.id !== 'undefined' && params.id !== 'null' && params.id !== '';

        if (validId) {
            fetchTask(params.id)
                .then((res) => {
                    const processDate = (dateValue) => {
                        if (!dateValue) return null;
                        return dayjs(dateValue);
                    };

                    setTaskData({
                        ...res.data,
                        startDate: processDate(res.data.startDate) || dayjs(),
                        deadline: processDate(res.data.deadline),
                        status: res.data.status || 'Pendiente',
                        collaborators: res.data.collaborators || [],
                        creator: res.data.creator || userEmail,
                        creator_name: res.data.creator_name || userFullName,
                        recurso: res.data.recurso || [],
                        _id: res.data._id || res.data.id,
                    });

                    //  Validación de permiso obtenido
                    const perm = getPermission(res.data, userEmail);
                    const validPerms = ['read', 'write', 'admin'];
                    const finalPerm = validPerms.includes(perm) ? perm : 'none';
                    setPermission(finalPerm);

                    setNoDeadline(!res.data.deadline);
                })
                .catch(() => {
                    message.error('Error al cargar la tarea');
                });
        } else {
            setTaskData((prev) => ({
                ...prev,
                startDate: dayjs(),
                creator: userEmail,
                creator_name: userFullName,
            }));
            setPermission('admin');
        }
    }, [params.id, userEmail, userFullName]);


    if (params.id && permission === 'read') {
        return (
            <div className="text-center mt-10 text-xl text-red-500">
                No tienes permisos para editar esta tarea.
            </div>
        );
    }

    return (
        <ConfigProvider locale={esES}>
            <div className="flex items-start justify-center min-h-screen w-full bg-white dark:bg-[#1f1f1f] px-4 text-black dark:text-white">
                <div className="w-full max-w-4xl py-10">
                    {/* Mensaje de permiso actual */}
                    <div className="mb-4 text-right text-sm text-gray-600 dark:text-gray-300 italic">
                        Permiso actual sobre esta tarea: <span className="font-medium">{permission}</span>
                    </div>

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
                            updatePermission={(id, perm) => {
                                const updated = taskData.collaborators.map((c) => {
                                    const identifier = c._id || c.id || c.email;
                                    return identifier === id ? { ...c, permission: perm } : c;
                                });
                                setTaskData((prev) => ({ ...prev, collaborators: updated }));
                            }}
                            userPermission={permission}
                        />


                        <DatePickers
                            startDate={taskData.startDate}
                            deadline={taskData.deadline}
                            noDeadline={noDeadline}
                            onChange={handleChange}
                            setNoDeadline={setNoDeadline}
                        />

                        <StatusSelector value={taskData.status} onChange={(val) => handleChange('status', val)} />

                        <FileUploader
                            recurso={taskData.recurso}
                            setRecurso={(archivos) => setTaskData((prev) => ({ ...prev, recurso: archivos }))}
                        />

                        <FormActions
                            isEditing={!!params.id}
                            onCancel={() => navigate(`/proyectos?projectId=${projectId}`)}
                            onDelete={handleDelete}
                            canDelete={permission === 'admin'}
                            loading={loading} // activamos loader y desactivamos
                        />
                    </form>
                </div>
            </div>
        </ConfigProvider>
    );

}

export default TaskForm;
