
import { Table, Tag, Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPermission, getStatusTag, formatDate } from './utils.jsx';



const TaskTable = ({ tasks, userFullName, userEmail, onDuplicate, onDelete, projectId }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: <div className="text-center w-full">Título</div>,
            dataIndex: 'title',
            key: 'title',
            render: (text) => <div className="text-left font-bold">{text}</div>,
        },
        {
            title: <div className="text-center w-full">Creador</div>,
            dataIndex: 'creator_name',
            key: 'creator_name',
            render: (creatorName) => <div className="text-left text-black">{creatorName || 'Sin creador'}</div>,
        },
        {
            title: <div className="text-center w-full">Colaboradores</div>,
            dataIndex: 'collaborators',
            key: 'collaborators',
            render: (collaborators) => {
                if (!collaborators || collaborators.length === 0) return <div className="text-left">Ninguno</div>;
                return (
                    <div className="text-left space-x-1">
                        {collaborators.map((col, index) => (
                            <Tag
                                key={index}
                                color={
                                    col.permission === 'admin'
                                        ? 'red'
                                        : col.permission === 'write'
                                            ? 'blue'
                                            : 'default'
                                }
                            >
                                {col.email} ({col.permission})
                            </Tag>
                        ))}
                    </div>
                );
            },
        },
        {
            title: <div className="text-center w-full">Inicio</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => <div className="text-left">{formatDate(date)}</div>,
        },
        {
            title: <div className="text-center w-full">Límite</div>,
            dataIndex: 'deadline',
            key: 'deadline',
            render: (date) => <div className="text-left">{formatDate(date)}</div>,
        },
        {
            title: <div className="text-center w-full">Estado</div>,
            dataIndex: 'status',
            key: 'status',
            render: (status) => <div className="text-left">{getStatusTag(status)}</div>,
        },
        {
            title: <div className="text-center w-full">Acciones</div>,
            key: 'acciones',
            align: 'center',
            render: (_, record) => {
                const permission = getPermission(record, userFullName, userEmail);
                return (
                    <Space>
                        {(permission === 'write' || permission === 'admin') && (
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/tasks/${record.id}/edit?projectId=${projectId}`)}
                                style={{ backgroundColor: '#FED36A', borderColor: '#FED36A', color: '#1A1A1A', fontWeight: 'bold' }}
                            >
                                Editar
                            </Button>
                        )}
                        {['read', 'write', 'admin'].includes(permission) && (
                            <Button
                                onClick={() => onDuplicate(record)}
                                icon={<CopyOutlined />}
                                style={{ borderColor: '#FED36A', color: '#1A1A1A', fontWeight: 'bold' }}
                            >
                                Duplicar
                            </Button>
                        )}
                        {permission === 'admin' && (
                            <Popconfirm
                                title="¿Estás seguro de borrar esta tarea?"
                                onConfirm={() => onDelete(record.id)}
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
            },
        },
    ];

    const tableData = tasks.map((task) => ({
        key: task._id,
        id: task._id,
        title: task.title || 'Sin título',
        description: task.description || '',
        creator_name: task.creator_name || 'Desconocido',
        startDate: task.startDate,
        deadline: task.deadline,
        status: task.status || '',
        collaborators: task.collaborators || [],
    }));

    return (
        <div className="overflow-x-auto">
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                expandable={{
                    expandedRowRender: (record) => (
                        <div className="prose max-w-none text-black" dangerouslySetInnerHTML={{ __html: record.description }} />
                    ),
                    rowExpandable: (record) => record.description && record.description.length > 0,
                }}
                scroll={{ x: true }}
            />
        </div>
    );
};

export default TaskTable;