import { ConfigProvider, message } from 'antd';
import esES from 'antd/es/locale/es_ES';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useSearchParams } from 'react-router-dom';
import {
    createTask,
    deleteTask,
    fetchTasksByProject,
    fetchTasksForCollaboratorByProject,
    fetchTask,
    updateTask,
} from '../../api/tasks';
import dayjs from '../../utils/dayjsConfig';
import TaskFilters from './list/TaskFilters';
import TaskKanbanBoard from './list/TaskKanbanBoard';
import TaskMobileCard from './list/TaskMobileCard';
import TaskTable from './list/TaskTable.jsx';
import { getPermission } from './list/utils.jsx';

const TaskList = ({ projectId, kanban = false, projectPermission = null }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userFullName = `${user.nombre || ''} ${user.apellidos || ''}`.trim();
    const userEmail = user.email || '';
    const isMobile = useMediaQuery({ maxWidth: 1540 });

    const [localTasks, setLocalTasks] = useState([]);

    const updateTaskInLocalState = (updatedTask) => {
        setLocalTasks((prevTasks) =>
            prevTasks.map((task) =>
                (task._id || task.id) === (updatedTask._id || updatedTask.id) ? updatedTask : task
            )
        );
    };

    const loadTasks = async () => {
        try {
            let result;
            result = await fetchTasksByProject(projectId);
            setLocalTasks(Array.isArray(result.data) ? result.data : []);


        } catch (err) {
            console.error('Error al cargar tareas:', err);
            message.error('Error al cargar tareas');
        }
    };

    useEffect(() => {
        loadTasks();
    }, [projectId]);

    const tableContainerRef = useRef(null);
    const [forceMobileView, setForceMobileView] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            const container = tableContainerRef.current;
            if (container) {
                setForceMobileView(container.scrollWidth > container.clientWidth);
            }
        };
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, []);

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
        if (filters.startDate) params.startDate = filters.startDate.format('YYYY-MM-DD');
        if (filters.deadline) params.deadline = filters.deadline.format('YYYY-MM-DD');
        setSearchParams(params);
    }, [filters, setSearchParams]);

    const parsedTasks = useMemo(() => {
        return localTasks.map((task) => {
            const taskId = task._id || task.id;
            return {
                ...task,
                id: taskId,
                key: taskId,
                startDate: task.startDate ? dayjs(task.startDate) : null,
                deadline: task.deadline ? dayjs(task.deadline) : null,
            };
        });
    }, [localTasks]);

    const filteredTasks = useMemo(() => {
        return parsedTasks
            .filter((task) => ['read', 'write', 'admin'].includes(task.effective_permission))
            .filter((task) => {
                const matchesTitle = filters.title
                    ? task.title?.toLowerCase().includes(filters.title.toLowerCase())
                    : true;

                const matchesCreator = filters.creator
                    ? (task.creator_name || '').toLowerCase().includes(filters.creator.toLowerCase())
                    : true;

                const matchesStatus = filters.status
                    ? (task.status || '').toLowerCase() === filters.status.toLowerCase()
                    : true;

                const matchesRecurso =
                    filters.has_recurso === 'yes'
                        ? Array.isArray(task.recurso) && task.recurso.length > 0
                        : filters.has_recurso === 'no'
                            ? !task.recurso || task.recurso.length === 0
                            : true;

                const matchesStartDate = filters.startDate
                    ? task.startDate?.format('YYYY-MM-DD') === filters.startDate.format('YYYY-MM-DD')
                    : true;

                const matchesDeadline = filters.deadline
                    ? task.deadline?.format('YYYY-MM-DD') === filters.deadline.format('YYYY-MM-DD')
                    : true;

                return (
                    matchesTitle &&
                    matchesCreator &&
                    matchesStatus &&
                    matchesRecurso &&
                    matchesStartDate &&
                    matchesDeadline
                );
            });
    }, [parsedTasks, filters]);


    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            loadTasks();
        } catch {
            message.error('Error al eliminar la tarea');
        }
    };

    const handleDuplicate = async (record) => {
        try {
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

            await createTask(duplicatedTask);
            message.success('Tarea duplicada correctamente');
            loadTasks();
        } catch (error) {
            console.error('Error al duplicar:', error);
            message.error('Error al duplicar la tarea');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await updateTask(taskId, { status: newStatus });
            const updatedTask = response.data;
            updateTaskInLocalState(updatedTask);
            message.success('Estado actualizado');
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            message.error('Error al actualizar el estado');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({ title: '', creator: '', status: '', has_recurso: '', startDate: null, deadline: null });
        setSearchParams({});
    };

    return (
        <ConfigProvider locale={esES}>
            <div className="min-w-0 w-full overflow-auto bg-gray-100 dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4">
                <TaskFilters filters={filters} onChange={handleFilterChange} onReset={resetFilters} />

                {kanban ? (
                    <TaskKanbanBoard
                        tasks={filteredTasks}
                        setTasks={setLocalTasks}
                        userEmail={userEmail}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        projectId={projectId}
                        onTaskChanged={updateTaskInLocalState}
                    />
                ) : (isMobile || forceMobileView) ? (
                    <TaskMobileCard
                        tasks={filteredTasks}
                        userEmail={userEmail}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        projectId={projectId}
                    />
                ) : (
                    <div ref={tableContainerRef}>
                        <TaskTable
                            tasks={filteredTasks}
                            userEmail={userEmail}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            projectId={projectId}
                        />
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default TaskList;
