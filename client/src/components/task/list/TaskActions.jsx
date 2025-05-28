// client/src/components/task/list/TaskActions.jsx
import { Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPermission } from './utils.jsx';

const TaskActions = ({ task, userEmail, projectId, onDuplicate, onDelete }) => {
    const navigate = useNavigate();
    const permission = getPermission(task, userEmail);
    const taskId = task.id || task._id;

    return (
        <div className="flex items-center justify-center gap-2 mt-3">
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
            )
            }

            {
                ['read', 'write', 'admin'].includes(permission) && (
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
                )
            }

            {
                permission === 'admin' && (
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
                )
            }
        </div >
    );
};

export default TaskActions;
