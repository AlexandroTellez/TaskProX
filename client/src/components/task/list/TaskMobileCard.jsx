import { Button, Tag, Popconfirm } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPermission, getStatusTag, formatDate } from './utils.jsx';

const TaskMobileCard = ({ tasks, userEmail, onDuplicate, onDelete, projectId }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {tasks.map((task) => {
                const permission = getPermission(task, userEmail);

                return (
                    <div
                        key={task.id || task._id}
                        className="border dark:border-[#FFFFFF] p-4 rounded-md shadow bg-white text-black dark:bg-[#2a2e33] dark:text-white"
                    >
                        <p className="font-bold text-lg mb-2">{task.title}</p>

                        <p className="text-sm mb-1">
                            <strong>Creador:</strong> {task.creator_name || 'Desconocido'}
                        </p>

                        <p className="text-sm mb-1">
                            <strong>Colaboradores:</strong>{' '}
                            {task.collaborators?.length > 0 ? (
                                task.collaborators.map((c, i) => (
                                    <Tag
                                        key={i}
                                        color={
                                            c.permission === 'admin'
                                                ? 'red'
                                                : c.permission === 'write'
                                                    ? 'blue'
                                                    : 'default'
                                        }
                                    >
                                        {c.email} ({c.permission})
                                    </Tag>
                                ))
                            ) : (
                                'Ninguno'
                            )}
                        </p>

                        <p className="text-sm mb-1">
                            <strong>Fecha de inicio:</strong> {formatDate(task.startDate)}
                        </p>

                        <p className="text-sm mb-1">
                            <strong>Fecha límite:</strong> {formatDate(task.deadline)}
                        </p>

                        <p className="text-sm mb-2">
                            <strong>Estado:</strong> {getStatusTag(task.status)}
                        </p>

                        {task.description && (
                            <details className="mb-3">
                                <summary className="cursor-pointer text-sm font-bold">
                                    📄 Ver descripción tarea:
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
                                    onClick={() =>
                                        navigate(`/tasks/${task.id || task._id}/edit?projectId=${projectId}`)
                                    }
                                    style={{
                                        backgroundColor: '#FED36A',
                                        borderColor: '#FED36A',
                                        color: '#1A1A1A',
                                        fontWeight: 'bold',
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
                                        borderColor: '#FED36A',
                                        color: '#1A1A1A',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Duplicar
                                </Button>
                            )}

                            {permission === 'admin' && (
                                <Popconfirm
                                    title="¿Estás seguro de borrar esta tarea?"
                                    onConfirm={() => onDelete(task.id || task._id)}
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
