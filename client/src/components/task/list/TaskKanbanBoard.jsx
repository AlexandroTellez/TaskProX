// client/src/components/task/list/TaskKanbanBoard.jsx
import { DownloadOutlined } from '@ant-design/icons';
import {
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Button, Tag, message } from 'antd';
import { useEffect } from 'react';
import { formatDate, getPermission, getStatusTag } from './utils';
import TaskActions from './TaskActions'; // 👈 Importado aquí

const predefinedStatuses = [
    'pendiente',
    'en espera',
    'lista para comenzar',
    'en progreso',
    'en revisión',
    'completado',
];

// Función para descargar archivos base64
function descargarArchivo(file) {
    try {
        if (!file || !file.data || typeof file.data !== "string") return;

        let base64Data = file.data;
        const match = file.data.match(/^data:(.*);base64,(.*)$/);
        if (match) base64Data = match[2];

        const byteCharacters = atob(base64Data.trim());
        const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name || 'archivo';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success(`Descarga completada: ${file.name}`);
    } catch (err) {
        console.error('Error al descargar el archivo:', err);
        message.error('Error al descargar el archivo');
    }
}

const TaskKanbanBoard = ({ tasks, userEmail, onDuplicate, onDelete, onStatusChange, projectId }) => {
    const allStatuses = [...predefinedStatuses];
    const taskStatuses = tasks.map((t) => t.status?.toLowerCase().trim()).filter(Boolean);
    taskStatuses.forEach((s) => {
        if (!allStatuses.includes(s)) allStatuses.push(s);
    });

    useEffect(() => {
        allStatuses.forEach((status) => {
            const zone = document.getElementById(`drop-${status}`);
            if (zone) {
                dropTargetForElements({
                    element: zone,
                    getData: () => ({ type: 'status-zone', status }),
                    onDrop: (args) => {
                        const taskId = args.source.data.taskId;
                        onStatusChange(taskId, status);
                    },
                });
            }
        });
    }, [tasks]);

    const renderTaskCard = (task) => {
        const taskId = task._id || task.id;

        return (
            <div
                key={taskId}
                className="bg-white dark:bg-[#1f1f1f] dark:text-white text-black p-4 rounded-md border dark:border-[#FFFFFF] shadow space-y-2"
                ref={(el) =>
                    el &&
                    draggable({
                        element: el,
                        getInitialData: () => ({ type: 'task', taskId }),
                    })
                }
            >
                <p className="font-bold text-lg mb-2">{task.title}</p>

                <p className="text-sm"><strong>Creador:</strong> {task.creator_name || 'Desconocido'}</p>
                <p className="text-sm">
                    <strong>Colaboradores:</strong>{' '}
                    {task.collaborators?.length > 0 ? (
                        task.collaborators.map((c, i) => (
                            <Tag key={i} color={c.permission === 'admin' ? 'red' : c.permission === 'write' ? 'blue' : 'default'}>
                                {c.email} ({c.permission})
                            </Tag>
                        ))
                    ) : 'Ninguno'}
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
                    <details className="text-sm">
                        <summary className="cursor-pointer font-semibold">📄 Ver descripción tarea</summary>
                        <div
                            className="prose prose-sm max-w-none dark:prose-invert mt-2"
                            dangerouslySetInnerHTML={{ __html: task.description }}
                        />
                    </details>
                )}

                {/* Acciones comunes reutilizadas */}
                <div className="mt-3">
                    <TaskActions
                        task={task}
                        userEmail={userEmail}
                        projectId={projectId}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="overflow-x-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-6 gap-4">
                {allStatuses.map((status) => (
                    <div key={status} id={`drop-${status}`} className="bg-gray-100 dark:bg-[#2a2e33] p-3 rounded">
                        <h3 className="text-center text-sm font-bold text-black dark:text-white mb-2">
                            {getStatusTag(status)}
                        </h3>
                        <div className="space-y-2">
                            {tasks.filter((t) => t.status?.toLowerCase().trim() === status).map(renderTaskCard)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskKanbanBoard;
