import {
    CopyOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { App, Button, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { deleteTask } from '../../api/tasks';
import { formatDate, getPermission, getStatusTag } from './list/utils';
import { useDraggable } from '@dnd-kit/core';

function descargarArchivo(file) {
    try {
        if (!file || !file.data || typeof file.data !== 'string') return;

        let base64Data = file.data;
        const match = file.data.match(/^data:(.*);base64,(.*)$/);
        if (match) base64Data = match[2];

        const byteCharacters = atob(base64Data.trim());
        const byteNumbers = Array.from(byteCharacters).map((c) => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = file.name || 'archivo';
        link.click();
    } catch (err) {
        console.error('Error al descargar archivo:', err);
    }
}

function TaskCard({ task, onTaskChanged, onDuplicate, projectId }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userEmail = user.email || '';
    const taskId = task._id || task.id;
    const { message } = App.useApp();

    const permission =
        getPermission(task, userEmail) ||
        task.effective_permission ||
        task.permission ||
        task.project_permission ||
        null;

    // Solo permitir arrastrar si el usuario tiene permisos write o admin
    const isDraggable = permission === 'write' || permission === 'admin';
    const { attributes, listeners, setNodeRef } = useDraggable({ id: taskId });

    // Eliminar tarea
    const handleDelete = async () => {
        try {
            await deleteTask(taskId);
            if (onTaskChanged) onTaskChanged();
        } catch (err) {
            console.error('Error al eliminar tarea:', err);
        }
    };

    return (
        <div
            ref={isDraggable ? setNodeRef : null}
            {...(isDraggable ? attributes : {})}
            {...(isDraggable ? listeners : {})}
            style={{
                cursor: isDraggable ? 'grab' : 'default',
                userSelect: 'none',
                touchAction: 'manipulation',
                transition: 'opacity 0.2s ease-in-out',
            }}
            className="border dark:border-white p-4 rounded-md shadow bg-white text-black dark:bg-[#1f1f1f] dark:text-white max-w-screen-sm md:max-w-md lg:max-w-lg mx-auto"
        >
            <p className="font-bold text-lg mb-2">{task.title}</p>

            <div className="space-y-1">
                <p className="text-sm"><strong>Creador:</strong> {task.creator_name || 'Desconocido'}</p>
                <p className="text-sm">
                    <strong>Colaboradores:</strong>{' '}
                    {task.collaborators?.length > 0
                        ? task.collaborators.map((c, i) => (
                            <Tag
                                key={i}
                                color={
                                    c.permission === 'admin' ? 'red' :
                                        c.permission === 'write' ? 'blue' : 'default'
                                }
                            >
                                {c.email} ({c.permission})
                            </Tag>
                        ))
                        : 'Ninguno'}
                </p>
                <p className="text-sm"><strong>Fecha de inicio:</strong> {formatDate(task.startDate)}</p>
                <p className="text-sm"><strong>Fecha límite:</strong> {formatDate(task.deadline)}</p>
                <p className="text-sm"><strong>Estado:</strong> {getStatusTag(task.status)}</p>

                {task.recurso?.length > 0 && (
                    <div className="text-sm">
                        <strong>Archivos adjuntos:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            {task.recurso.map((file, index) => (
                                <li key={index}>
                                    <Button
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        onClick={() => descargarArchivo(file)}
                                        className="px-0 text-blue-500 dark:text-blue-300 !whitespace-normal !break-words !text-left !p-0 max-w-full"
                                    >
                                        {file.name}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {task.description && (
                    <details className="mb-3">
                        <summary className="cursor-pointer text-sm font-bold">
                            📄 Haz clic para ver la descripción
                        </summary>
                        <div
                            className="prose prose-sm max-w-none text-black dark:text-white dark:prose-invert mt-2"
                            dangerouslySetInnerHTML={{ __html: task.description }}
                        />
                    </details>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                {(permission === 'write' || permission === 'admin') && (
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/tasks/${taskId}/edit?projectId=${projectId}`)}
                        style={{
                            background: '#FFFFFF',
                            borderColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '6px',
                        }}
                    >
                        Editar
                    </Button>
                )}
                {['read', 'write', 'admin'].includes(permission) && (
                    <Button
                        onClick={() => onDuplicate(task)}
                        icon={<CopyOutlined />}
                        style={{
                            background: '#FFFFFF',
                            borderColor: '#6D28D9',
                            color: '#6D28D9',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '6px',
                        }}
                    >
                        Duplicar
                    </Button>
                )}
                {permission === 'admin' && (
                    <Popconfirm
                        title="¿Estás seguro de borrar esta tarea?"
                        onConfirm={handleDelete}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            style={{
                                borderColor: '#ff4d4f',
                                color: '#ff4d4f',
                                fontWeight: 'bold',
                            }}
                        >
                            Borrar
                        </Button>
                    </Popconfirm>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
