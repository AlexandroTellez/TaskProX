import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Progress, Button, Popconfirm, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteTask } from '../../api/tasks';

const getStatusTag = (status) => {
    let color;
    switch (status) {
        case 'Completado': color = 'green'; break;
        case 'En proceso': color = 'gold'; break;
        case 'Pendiente':
        case 'En peligro': color = 'red'; break;
        default: color = 'gray';
    }
    return <Tag color={color}>{status || 'Sin estado'}</Tag>;
};

// Formato dd/mm/yyyy
const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
};

const TaskList = ({ tasks, projectId, onTaskChanged }) => {
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            if (onTaskChanged) onTaskChanged();
        } catch (error) {
            message.error('Error al eliminar la tarea');
        }
    };

    const tableData = tasks.map((task, index) => ({
        key: task._id || index,
        id: task._id,
        name: task.title || 'Sin título',
        creator: task.creator || 'Desconocido',
        startDate: formatDate(task.startDate),
        deadline: formatDate(task.deadline),
        status: task.status || '',
        progress: task.progress ?? 0,
    }));

    const columns = [
        { title: 'Nombre Tarea', dataIndex: 'name', key: 'name' },
        { title: 'Creador', dataIndex: 'creator', key: 'creator' },
        { title: 'Fecha Inicio', dataIndex: 'startDate', key: 'startDate' },
        { title: 'Fecha Límite', dataIndex: 'deadline', key: 'deadline' },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Progreso',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress) => (
                <div className="flex items-center gap-2">
                    <Progress percent={progress} size="small" strokeColor="#FED36A" />
                </div>
            ),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/tasks/${record.id}/edit?projectId=${projectId}`)}
                        style={{
                            backgroundColor: '#FED36A',
                            borderColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                        }}
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Estás seguro de borrar esta tarea?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            danger
                            style={{
                                borderColor: '#ff4d4f',
                                color: '#ff4d4f',
                                fontWeight: 'bold',
                            }}
                            icon={<DeleteOutlined />}
                        >
                            Borrar
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
            />
        </div>
    );
};

export default TaskList;
