import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Table, Tag, Button, Popconfirm, message, Space, Input, Select, DatePicker, ConfigProvider
} from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { deleteTask, createTask } from '../../api/tasks';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import esES from 'antd/es/locale/es_ES';
import { useMediaQuery } from 'react-responsive';

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

const { Option } = Select;
const { RangePicker } = DatePicker;


const getStatusTag = (status) => {
    let color;
    switch (status) {
        case 'Completado': color = 'green'; break;
        case 'En proceso': color = 'gold'; break;
        case 'Pendiente': color = 'red'; break;
        default: color = 'gray';
    }
    return <Tag color={color}>{status || 'Sin estado'}</Tag>;
};

const formatDate = (dateString) => {
    if (!dateString || String(dateString).toLowerCase() === 'null') return 'Sin fecha límite';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Sin fecha límite' : date.toLocaleDateString('es-ES');
};

const getPermission = (task, userFullName, userEmail) => {
    if (task.creator_name === userFullName) return 'admin';
    const match = task.collaborators?.find(col => col.email === userEmail);
    return match?.permission || 'none';
};

const TaskList = ({ tasks, projectId, onTaskChanged }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem('user'));
    const userFullName = `${user?.nombre} ${user?.apellidos}`;
    const userEmail = user?.email;
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const [filters, setFilters] = useState({
        title: searchParams.get('title') || '',
        creator: searchParams.get('creator') || '',
        status: searchParams.get('status') || '',
        dateRange: searchParams.get('from') && searchParams.get('to')
            ? [dayjs(searchParams.get('from')), dayjs(searchParams.get('to'))]
            : null,
    });

    useEffect(() => {
        const params = {};
        if (filters.title) params.title = filters.title;
        if (filters.creator) params.creator = filters.creator;
        if (filters.status) params.status = filters.status;
        if (filters.dateRange) {
            params.from = filters.dateRange[0].toISOString();
            params.to = filters.dateRange[1].toISOString();
        }
        setSearchParams(params);
    }, [filters, setSearchParams]);

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            if (onTaskChanged) onTaskChanged();
        } catch (error) {
            message.error('Error al eliminar la tarea');
        }
    };

    const handleDuplicate = async (record) => {
        try {
            const duplicatedTask = {
                ...record,
                title: `${record.title} (copia)`,
                startDate: record.startDate,
                deadline: record.deadline,
                status: record.status || 'Pendiente',
                projectId,
            };
            delete duplicatedTask.id;
            delete duplicatedTask._id;
            await createTask(duplicatedTask);
            message.success('Tarea duplicada correctamente');
            if (onTaskChanged) onTaskChanged();
        } catch (err) {
            console.error(err);
            message.error('Error al duplicar la tarea');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({
            title: '',
            creator: '',
            status: '',
            dateRange: null,
        });
        setSearchParams({});
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { title, creator_name, status, startDate } = task;
            const matchesTitle = filters.title
                ? title?.toLowerCase().includes(filters.title.toLowerCase())
                : true;
            const matchesCreator = filters.creator
                ? creator_name?.toLowerCase().includes(filters.creator.toLowerCase())
                : true;
            const matchesStatus = filters.status
                ? status === filters.status
                : true;
            const matchesDateRange = filters.dateRange
                ? startDate &&
                dayjs(startDate).isAfter(filters.dateRange[0]) &&
                dayjs(startDate).isBefore(filters.dateRange[1])
                : true;
            return matchesTitle && matchesCreator && matchesStatus && matchesDateRange;
        });
    }, [tasks, filters]);

    const columns = [
        {
            title: <div className="text-center w-full">Título</div>,
            dataIndex: 'title',
            key: 'title',
            render: (text) => <div className="text-left font-bold">{text}</div>
        },
        {
            title: <div className="text-center w-full">Creador</div>,
            dataIndex: 'creator_name',
            key: 'creator_name',
            render: (creatorName) => <div className="text-left text-black">{creatorName || 'Sin creador'}</div>
        },
        {
            title: <div className="text-center w-full">Colaboradores</div>,
            dataIndex: 'collaborators',
            key: 'collaborators',
            render: (collaborators) => {
                if (!collaborators || collaborators.length === 0)
                    return <div className="text-left">Ninguno</div>;
                return (
                    <div className="text-left space-x-1">
                        {collaborators.map((col, index) => (
                            <Tag key={index} color={
                                col.permission === 'admin' ? 'red' :
                                    col.permission === 'write' ? 'blue' : 'default'
                            }>
                                {col.email} ({col.permission})
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: <div className="text-center w-full">Inicio</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => <div className="text-left">{date}</div>
        },
        {
            title: <div className="text-center w-full">Límite</div>,
            dataIndex: 'deadline',
            key: 'deadline',
            render: (date) => <div className="text-left">{date}</div>
        },
        {
            title: <div className="text-center w-full">Estado</div>,
            dataIndex: 'status',
            key: 'status',
            render: (status) => <div className="text-left">{getStatusTag(status)}</div>
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
                                onClick={() => handleDuplicate(record)}
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
                        )}
                    </Space>
                );
            }
        }
    ];

    const tableData = filteredTasks.map((task) => ({
        key: task._id,
        id: task._id,
        title: task.title || 'Sin título',
        description: task.description || '',
        creator_name: task.creator_name || 'Desconocido',
        startDate: formatDate(task.startDate),
        deadline: formatDate(task.deadline),
        status: task.status || '',
        collaborators: task.collaborators || []
    }));

    return (
        <ConfigProvider locale={esES}>
            <div className="w-full bg-white rounded-lg space-y-6">
                {/* Filtros */}
                <div className="flex flex-wrap gap-4">
                    <Input
                        placeholder="Buscar por título"
                        value={filters.title}
                        onChange={(e) => handleFilterChange('title', e.target.value)}
                        className="w-full sm:w-52"
                    />
                    <Input
                        placeholder="Buscar por creador"
                        value={filters.creator}
                        onChange={(e) => handleFilterChange('creator', e.target.value)}
                        className="w-full sm:w-52"
                    />
                    <Select
                        placeholder="Filtrar por estado"
                        value={filters.status || undefined}
                        onChange={(value) => handleFilterChange('status', value)}
                        allowClear
                        className="w-full sm:w-40"
                    >
                        <Option value="Pendiente">Pendiente</Option>
                        <Option value="En proceso">En proceso</Option>
                        <Option value="Completado">Completado</Option>
                    </Select>
                    <RangePicker
                        placeholder={['Fecha de inicio', 'Fecha final']}
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                        className="w-full sm:w-auto"
                        format="DD/MM/YYYY"
                        value={filters.dateRange}
                    />
                    <Button
                        onClick={resetFilters}
                        className="bg-neutral-200 hover:bg-neutral-300 font-semibold"
                    >
                        Limpiar filtros
                    </Button>
                </div>

                {/* Contenido responsive */}
                {isMobile ? (
                    <div className="space-y-4">
                        {tableData.map((task) => {
                            const permission = getPermission(task, userFullName, userEmail);
                            return (
                                <div key={task.id} className="border p-4 rounded-md shadow bg-white text-black">
                                    <p className="font-bold text-lg mb-2">{task.title}</p>
                                    <p className="text-sm mb-1"><strong>Creador:</strong> {task.creator_name}</p>
                                    <p className="text-sm mb-1"><strong>Colaboradores:</strong>{' '}
                                        {task.collaborators.length > 0 ? task.collaborators.map((c, i) => (
                                            <Tag key={i} color={
                                                c.permission === 'admin' ? 'red' :
                                                    c.permission === 'write' ? 'blue' : 'default'
                                            }>
                                                {c.email} ({c.permission})
                                            </Tag>
                                        )) : 'Ninguno'}
                                    </p>
                                    <p className="text-sm mb-1"><strong>Fecha de inicio:</strong> {task.startDate}</p>
                                    <p className="text-sm mb-1"><strong>Fecha límite:</strong> {task.deadline}</p>
                                    <p className="text-sm mb-2"><strong>Estado:</strong> {getStatusTag(task.status)}</p>

                                    {task.description && (
                                        <details className="mb-3">
                                            <summary className="cursor-pointer text-sm font-bold">📄 Ver descripción tarea:</summary>
                                            <div
                                                className="prose prose-sm max-w-none text-black mt-2"
                                                dangerouslySetInnerHTML={{ __html: task.description }}
                                            />
                                        </details>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(permission === 'write' || permission === 'admin') && (
                                            <Button
                                                icon={<EditOutlined />}
                                                onClick={() => navigate(`/tasks/${task.id}/edit?projectId=${projectId}`)}
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
                                                onClick={() => handleDuplicate(task)}
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
                                                onConfirm={() => handleDelete(task.id)}
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
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            pagination={false}
                            bordered
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div
                                        className="prose max-w-none text-black"
                                        dangerouslySetInnerHTML={{ __html: record.description }}
                                    />
                                ),
                                rowExpandable: (record) => record.description && record.description.length > 0,
                            }}
                            scroll={{ x: true }}
                        />
                    </div>
                )}
            </div>
        </ConfigProvider>
    );

};

export default TaskList;
