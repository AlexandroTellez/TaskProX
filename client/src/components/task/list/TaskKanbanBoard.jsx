import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive'; // ✅ Importa hook
import {
    draggable,
    dropTargetForElements,
    monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import TaskCard from '../TaskCard';
import { getStatusTag } from './utils';

// ===================== Estados predefinidos del tablero =====================
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
    userEmail,
    onDuplicate,
    onDelete,
    onStatusChange,
    projectId,
    onTaskChanged,
}) => {
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

    // ✅ Detectar si la pantalla es menor a 1540px
    const isSmallScreen = useMediaQuery({ maxWidth: 1540 });

    useEffect(() => {
        monitorForElements();
        allStatuses.forEach((status) => {
            const zone = document.getElementById(`drop-${status}`);
            if (zone) {
                dropTargetForElements({
                    element: zone,
                    getData: () => ({ type: 'status-zone', status }),
                    onDrop: (args) => {
                        const taskId = args.source.data.taskId;
                        onStatusChange(taskId, status);
                    },
                });
            }
        });
    }, [allStatuses, onStatusChange]);

    return (
        <div className="w-full">
            <div
                className={`grid grid-cols-1 ${isSmallScreen ? 'md:grid-cols-2' : 'lg:grid-cols-3'
                    } gap-4 overflow-x-auto px-2`}
            >
                {allStatuses.map((status) => {
                    const normalizedStatus = status.toLowerCase().trim();

                    return (
                        <div
                            key={status}
                            id={`drop-${status}`}
                            className="flex-shrink-0 w-full lg:min-w-[300px] bg-gray-100 dark:bg-[#2a2e33] p-3 rounded"
                        >
                            <div className="text-center mb-2">
                                {getStatusTag(status)}
                            </div>

                            <div className="space-y-2">
                                {tasksWithPermissions
                                    .filter((t) => t.status?.toLowerCase().trim() === normalizedStatus)
                                    .map((task) => {
                                        const taskId = task._id || task.id;
                                        const canEdit = task.effective_permission !== 'read';

                                        return (
                                            <div
                                                key={taskId}
                                                ref={(el) =>
                                                    el &&
                                                    canEdit &&
                                                    draggable({
                                                        element: el,
                                                        getInitialData: () => ({
                                                            type: 'task',
                                                            taskId,
                                                        }),
                                                    })
                                                }
                                            >
                                                <TaskCard
                                                    task={task}
                                                    onTaskChanged={onTaskChanged}
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
