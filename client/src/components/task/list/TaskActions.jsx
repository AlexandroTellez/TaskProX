import { Button, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const TaskActions = ({ task, userEmail, projectId, onDuplicate, onDelete, permission }) => {
    const navigate = useNavigate();

    // Mostrar en consola para depuración
    console.log("📥 Permiso recibido en TaskActions:", permission);

    // Obtener el id de la tarea con preferencia a _id, luego id
    const taskId = task?._id || task?.id;

    // Función segura para navegar a editar
    const handleEdit = () => {
        if (!taskId || taskId === 'undefined' || taskId === 'null') {
            message.error('ID de tarea inválido para editar.');
            return;
        }

        navigate(`/tasks/${taskId}/edit?projectId=${projectId}`);
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-3">
            {(permission === 'write' || permission === 'admin') && (
                <Button
                    icon={<EditOutlined />}
                    onClick={handleEdit}
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
    );
};

export default TaskActions;
