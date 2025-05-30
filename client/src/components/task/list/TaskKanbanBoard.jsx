import { useMediaQuery } from 'react-responsive';
import TaskCard from '../TaskCard';
import { getStatusTag } from './utils';

// ========== Estados predefinidos que se usarán como columnas del tablero ==========
const predefinedStatuses = [
    'pendiente',
    'en espera',
    'lista para comenzar',
    'en progreso',
    'en revisión',
    'completado',
];

const TaskKanbanBoard = ({
    tasks,
    setTasks,
    userEmail,
    onDuplicate,
    onDelete,
    onStatusChange,
    projectId,
    onTaskChanged,
}) => {
    const isSmallScreen = useMediaQuery({ maxWidth: 1540 });

    const taskStatuses = tasks
        .map((t) => t.status?.toLowerCase().trim())
        .filter(Boolean);
    const allStatuses = [...new Set([...predefinedStatuses, ...taskStatuses])];

    const tasksWithPermissions = tasks.map((task) => ({
        ...task,
        effective_permission:
            task.effective_permission ||
            task.permission ||
            task.project_permission ||
            task.collaborators?.find((c) => c.email === userEmail)?.permission ||
            'read',
    }));

    const handleTaskChanged = async (updatedTask) => {
        if (!updatedTask) {
            if (onTaskChanged) await onTaskChanged();
            return;
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === updatedTask.id || task._id === updatedTask.id
                    ? updatedTask
                    : task
            )
        );
    };


    return (
        <div className="w-full">
            <div className={`grid grid-cols-1 ${isSmallScreen ? 'md:grid-cols-2' : 'lg:grid-cols-3'} gap-4 overflow-x-auto px-2`}>
                {allStatuses.map((status) => {
                    const normalizedStatus = status.toLowerCase().trim();

                    return (
                        <div
                            key={status}
                            className="flex-shrink-0 w-full lg:min-w-[300px] bg-gray-100 dark:bg-[#2a2e33] p-3 rounded"
                        >
                            <div className="text-center mb-2">{getStatusTag(status)}</div>

                            <div className="space-y-2">
                                {tasksWithPermissions
                                    .filter((t) => t.status?.toLowerCase().trim() === normalizedStatus)
                                    .map((task) => {
                                        const taskId = task._id || task.id;

                                        return (
                                            <div key={taskId}>
                                                <TaskCard
                                                    task={task}
                                                    onTaskChanged={handleTaskChanged}
                                                    onDuplicate={onDuplicate}
                                                    projectId={projectId}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskKanbanBoard;