import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, ConfigProvider } from 'antd';
import esES from 'antd/es/locale/es_ES';
import { useMediaQuery } from 'react-responsive';
import dayjs from '../../utils/dayjsConfig';
import TaskFilters from './list/TaskFilters';
import TaskTable from './list/TaskTable';
import TaskMobileCard from './list/TaskMobileCard';
import { deleteTask, createTask } from '../../api/tasks';


const TaskList = ({ tasks, projectId, onTaskChanged }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem('user'));
    const userFullName = `${user?.nombre} ${user?.apellidos}`;
    const userEmail = user?.email;
    const isMobile = useMediaQuery({ maxWidth: 1024 });

    const [filters, setFilters] = useState({
        title: searchParams.get('title') || '',
        creator: searchParams.get('creator') || '',
        status: searchParams.get('status') || '',
        has_recurso: searchParams.get('has_recurso') || '',
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
        if (filters.has_recurso) params.has_recurso = filters.has_recurso;
        // Usar formato YYYY-MM-DD consistente con TaskForm
        if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD');
        if (filters.deadline) params.deadline = filters.deadline.format('YYYY-MM-DD');
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
            const matchesRecurso =
                filters.has_recurso === 'yes'
                    ? task.recurso && task.recurso.length > 0
                    : filters.has_recurso === 'no'
                        ? !task.recurso || task.recurso.length === 0
                        : true
            const matchesStartDate = filters.startDate
                ? task.startDate && task.startDate.format('YYYY-MM-DD') === filters.startDate.format('YYYY-MM-DD')
                : true;
            const matchesDeadline = filters.deadline
                ? task.deadline && task.deadline.format('YYYY-MM-DD') === filters.deadline.format('YYYY-MM-DD')
                : true;
            return (
                matchesTitle &&
                matchesCreator &&
                matchesStatus &&
                matchesStartDate &&
                matchesDeadline &&
                matchesRecurso
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
            // Preparar fechas para la duplicación - usar el mismo formato que TaskForm
            const prepareDate = (date) => {
                if (!date) return null;
                const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
                return dayjsDate.format('YYYY-MM-DD');
            };

            const duplicatedTask = {
                title: `${record.title} (copia)`,
                description: record.description || '',
                status: record.status || 'Pendiente',
                recurso: record.recurso || [],
                collaborators: record.collaborators || [],
                startDate: prepareDate(record.startDate),
                deadline: prepareDate(record.deadline),
                projectId,
                creator: userEmail,
                creator_name: userFullName,
            };

            console.log('Duplicando tarea con fechas:', {
                startDate: duplicatedTask.startDate,
                deadline: duplicatedTask.deadline
            });

            await createTask(duplicatedTask);
            message.success('Tarea duplicada correctamente');
            onTaskChanged && onTaskChanged();
        } catch (error) {
            console.error('Error al duplicar:', error);
            message.error('Error al duplicar la tarea');
        }
    };

    const handleFilterChange = (field, value) => {
        console.log(`Filtro ${field} cambiado a:`, value?.format ? value.format('YYYY-MM-DD') : value);
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({ title: '', creator: '', status: '', has_recurso: '', startDate: null, deadline: null });
        setSearchParams({});
    };

    return (
        <ConfigProvider locale={esES}>
            <div className="w-full bg-white dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4">
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