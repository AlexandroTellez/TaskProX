import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, ConfigProvider } from 'antd';
import esES from 'antd/es/locale/es_ES';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';

import TaskFilters from './list/TaskFilters';
import TaskTable from './list/TaskTable';
import TaskMobileCard from './list/TaskMobileCard';
import { deleteTask, createTask } from '../../api/tasks';
import { getPermission, formatDate } from './list/utils.jsx';

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

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
        startDate: (() => {
            const date = searchParams.get('startDate');
            return date && dayjs(date).isValid() ? dayjs(date) : null;
        })(),
        deadline: (() => {
            const date = searchParams.get('deadline');
            return date && dayjs(date).isValid() ? dayjs(date) : null;
        })(),
    });

    useEffect(() => {
        const params = {};
        if (filters.title) params.title = filters.title;
        if (filters.creator) params.creator = filters.creator;
        if (filters.status) params.status = filters.status;
        if (filters.startDate) params.startDate = filters.startDate.toISOString();
        if (filters.deadline) params.deadline = filters.deadline.toISOString();
        setSearchParams(params);
    }, [filters, setSearchParams]);

    const parsedTasks = useMemo(() => {
        return tasks.map((task) => ({
            ...task,
            startDate: task.startDate ? dayjs(task.startDate) : null,
            deadline: task.deadline ? dayjs(task.deadline) : null,
        }));
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return parsedTasks.filter((task) => {
            const matchesTitle = filters.title
                ? task.title?.toLowerCase().includes(filters.title.toLowerCase())
                : true;
            const matchesCreator = filters.creator
                ? task.creator_name?.toLowerCase().includes(filters.creator.toLowerCase())
                : true;
            const matchesStatus = filters.status ? task.status === filters.status : true;
            const matchesStartDate = filters.startDate
                ? task.startDate && task.startDate.isSame(filters.startDate, 'day')
                : true;
            const matchesDeadline = filters.deadline
                ? task.deadline && task.deadline.isSame(filters.deadline, 'day')
                : true;
            return (
                matchesTitle &&
                matchesCreator &&
                matchesStatus &&
                matchesStartDate &&
                matchesDeadline
            );
        });
    }, [parsedTasks, filters]);


    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            onTaskChanged && onTaskChanged();
        } catch {
            message.error('Error al eliminar la tarea');
        }
    };

    const handleDuplicate = async (record) => {
        try {
            const duplicatedTask = {
                ...record,
                title: `${record.title} (copia)`,
                status: record.status || 'Pendiente',
                projectId,
            };
            delete duplicatedTask.id;
            delete duplicatedTask._id;
            await createTask(duplicatedTask);
            message.success('Tarea duplicada correctamente');
            onTaskChanged && onTaskChanged();
        } catch {
            message.error('Error al duplicar la tarea');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({ title: '', creator: '', status: '', startDate: null, deadline: null });
        setSearchParams({});
    };

    return (
        <ConfigProvider locale={esES}>
            <div className="w-full bg-white rounded-lg space-y-6">
                <TaskFilters filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
                {isMobile ? (
                    <TaskMobileCard
                        tasks={filteredTasks}
                        userFullName={userFullName}
                        userEmail={userEmail}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        projectId={projectId}
                    />
                ) : (
                    <TaskTable
                        tasks={filteredTasks}
                        userFullName={userFullName}
                        userEmail={userEmail}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        projectId={projectId}
                    />
                )}
            </div>
        </ConfigProvider>
    );
};

export default TaskList;
