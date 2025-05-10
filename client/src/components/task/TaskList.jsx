import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Progress, Button, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteTask } from '../../api/tasks';

const getStatusTag = (status) => {
    let color;
    switch (status) {
        case 'Completado': color = 'green'; break;
        case 'En proceso': color = 'gold'; break;
        case 'Pendiente':
        case 'At risk': color = 'red'; break;
        default: color = 'gray';
    }
    return <Tag color={color}>{status || 'Sin estado'}</Tag>;
};

const TaskList = ({ tasks, projectId }) => {
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            window.location.reload(); // Idealmente se reemplazaría por una actualización del estado
        } catch (error) {
            message.error('Error al eliminar la tarea');
        }
    };

    const tableData = tasks.map((task, index) => ({
        key: task._id || index,
        id: task._id,
        name: task.title || 'Sin título',
        creator: task.creator || 'Desconocido',
        startDate: task.startDate || 'Sin fecha',
        deadline: task.deadline || 'Sin fecha',
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
                <div className="flex gap-2">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/tasks/${record.id}/edit?projectId=${projectId}`)}
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Estás seguro de borrar esta tarea?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Borrar
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-end mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/tasks/new?projectId=${projectId}`)}
                    style={{
                        backgroundColor: '#FED36A',
                        borderColor: '#FED36A',
                        color: '#1A1A1A',
                        fontWeight: 'bold',
                    }}
                >
                    Crear Nueva Tarea
                </Button>
            </div>
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
