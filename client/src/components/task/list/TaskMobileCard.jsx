import { Button, Tag, Popconfirm, message } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPermission, getStatusTag, formatDate } from './utils.jsx';

// ===================== Función para descarga de archivos base64 =====================
function descargarArchivo(file) {
    try {
        if (!file || !file.data || typeof file.data !== "string") {
            console.error("Archivo inválido o sin contenido base64:", file);
            return;
        }

        let base64Data = file.data;
        const base64Match = file.data.match(/^data:(.*);base64,(.*)$/);
        if (base64Match) {
            base64Data = base64Match[2];
        }

        const byteCharacters = atob(base64Data.trim());
        const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

        let safeFileName = file.name || 'archivo';
        if (safeFileName.startsWith('.')) {
            safeFileName = `descarga_${safeFileName.replace(/^\.+/, '')}`;
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success(`Descarga completada: ${safeFileName}`);
    } catch (error) {
        console.error('Error al intentar descargar el archivo:', error);
        message.error('Error al descargar el archivo');
    }
}

// ===================== Tarjeta para vista móvil de tareas =====================
const TaskMobileCard = ({ tasks, userEmail, onDuplicate, onDelete, projectId }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {tasks.map((task) => {
                const taskId = task._id || task.id;
                const permission = getPermission(task, userEmail) || task.effective_permission || task.permission || task.project_permission || null;

                return (
                    <div
                        key={taskId}
                        className="border dark:border-[#FFFFFF] p-4 rounded-md shadow bg-white text-black dark:bg-[#2a2e33] dark:text-white"
                    >
                        <p className="font-bold text-lg mb-2">{task.title}</p>

                        <p className="text-sm mb-1"><strong>Creador:</strong> {task.creator_name || 'Desconocido'}</p>

                        <p className="text-sm mb-1">
                            <strong>Colaboradores:</strong>{' '}
                            {task.collaborators?.length > 0 ? (
                                task.collaborators.map((c, i) => (
                                    <Tag
                                        key={i}
                                        color={
                                            c.permission === 'admin' ? 'red' :
                                                c.permission === 'write' ? 'blue' :
                                                    'default'
                                        }
                                    >
                                        {c.email} ({c.permission})
                                    </Tag>
                                ))
                            ) : 'Ninguno'}
                        </p>

                        <p className="text-sm mb-1"><strong>Fecha de inicio:</strong> {formatDate(task.startDate)}</p>
                        <p className="text-sm mb-1"><strong>Fecha límite:</strong> {formatDate(task.deadline)}</p>
                        <p className="text-sm mb-2"><strong>Estado:</strong> {getStatusTag(task.status)}</p>

                        {task.recurso?.length > 0 && (
                            <div className="text-sm mb-2">
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

                        <div className="flex flex-wrap gap-2 mt-3">
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
                                    onConfirm={() => onDelete(taskId)}
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
            })}
        </div>
    );
};

export default TaskMobileCard;
