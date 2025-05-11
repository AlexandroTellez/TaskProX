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

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');

// Semana empieza el lunes (día 1)
dayjs.updateLocale('es', {
    weekStart: 1
});

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

const TaskList = ({ tasks, projectId, onTaskChanged }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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
            const { title, creator, status, startDate } = task;
            const matchesTitle = filters.title
                ? title?.toLowerCase().includes(filters.title.toLowerCase())
                : true;
            const matchesCreator = filters.creator
                ? creator?.toLowerCase().includes(filters.creator.toLowerCase())
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
        { title: 'Título', dataIndex: 'title', key: 'title' },
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

                    <Button
                        onClick={handleDuplicate}
                        icon={<CopyOutlined />}
                        style={{
                            borderColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                        }}
                    >
                        Duplicar
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

    const tableData = filteredTasks.map((task) => ({
        key: task._id,
        id: task._id,
        title: task.title || 'Sin título',
        description: task.description || '',
        creator: task.creator || 'Desconocido',
        startDate: formatDate(task.startDate),
        deadline: formatDate(task.deadline),
        status: task.status || '',
    }));

    return (
        <ConfigProvider locale={esES}>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6 overflow-x-auto">
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
        </ConfigProvider>
    );
};

export default TaskList;
