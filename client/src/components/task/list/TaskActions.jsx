
import { Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPermission } from './utils.jsx';


const TaskActions = ({ task, userFullName, userEmail, projectId, onDuplicate, onDelete }) => {
    const navigate = useNavigate();
    const permission = getPermission(task, userFullName, userEmail);

    return (
        <Space>
            {(permission === 'write' || permission === 'admin') && (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/tasks/${task.id}/edit?projectId=${projectId}`)}
                    style={{ backgroundColor: '#FED36A', borderColor: '#FED36A', color: '#1A1A1A', fontWeight: 'bold' }}
                >
                    Editar
                </Button>
            )}

            {['read', 'write', 'admin'].includes(permission) && (
                <Button
                    onClick={() => onDuplicate(task)}
                    icon={<CopyOutlined />}
                    style={{ borderColor: '#FED36A', color: '#1A1A1A', fontWeight: 'bold' }}
                >
                    Duplicar
                </Button>
            )}

            {permission === 'admin' && (
                <Popconfirm
                    title="¿Estás seguro de borrar esta tarea?"
                    onConfirm={() => onDelete(task.id)}
                    okText="Sí"
                    cancelText="No"
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        style={{ borderColor: '#ff4d4f', color: '#ff4d4f', fontWeight: 'bold' }}
                    >
                        Borrar
                    </Button>
                </Popconfirm>
            )}
        </Space>
    );
};

export default TaskActions;