import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { updateTaskStatus } from '../../../api/tasks';
import TaskCard from '../TaskCard';
import { getStatusTag } from './utils';
import { useMediaQuery } from 'react-responsive';

const predefinedStatuses = [
    'pendiente',
    'en espera',
    'lista para comenzar',
    'en progreso',
    'en revisión',
    'completado',
];

// Componente droppable para cada columna
const DroppableColumn = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className="min-w-[300px] bg-gray-100 dark:bg-[#2a2e33] p-3 rounded"
        >
            {children}
        </div>
    );
};

const TaskKanbanBoard = ({
    tasks,
    setTasks,
    projectId,
    onDuplicate,
    onDelete,
    userEmail,
    onTaskChanged,
}) => {
    const [activeTask, setActiveTask] = useState(null);

    // Detectar si es móvil o tablet
    const isSmallScreen = useMediaQuery({ maxWidth: 1279 });

    // Sensores para drag
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 10 },
        })
    );

    const taskStatuses = tasks
        .map((t) => t.status?.toLowerCase().trim())
        .filter(Boolean);
    const allStatuses = [...new Set([...predefinedStatuses, ...taskStatuses])];

    const handleDragStart = (event) => {
        const { active } = event;
        const task = tasks.find((t) => (t._id || t.id) === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || over.id === active.id) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id;
        const newStatus = over.id;

        try {
            await updateTaskStatus(taskId, newStatus);
            window.location.reload();
        } catch (err) {
            console.error('Error actualizando estado:', err);
        } finally {
            setActiveTask(null);
        }
    };

    // ========= VISTA MÓVIL: sin drag, solo TaskCard con selector =========
    if (isSmallScreen) {
        return (
            <div className="flex flex-col gap-6 px-2 w-full max-w-full overflow-x-hidden">
                {allStatuses.map((status) => {
                    const columnTasks = tasks.filter(
                        (t) => t.status?.toLowerCase().trim() === status
                    );

                    return (
                        <div
                            key={status}
                            className="w-full bg-gray-100 dark:bg-[#2a2e33] p-3 rounded overflow-hidden"
                        >
                            <div className="text-center mb-2">{getStatusTag(status)}</div>
                            <div className="space-y-4">
                                {columnTasks.map((task) => (
                                    <TaskCard
                                        key={task._id || task.id}
                                        task={task}
                                        onTaskChanged={onTaskChanged}
                                        onDuplicate={onDuplicate}
                                        projectId={projectId}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

        );
    }


    // =========VISTA ESCRITORIO: Kanban con drag =========
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                {allStatuses.map((status) => {
                    const columnTasks = tasks.filter(
                        (t) => t.status?.toLowerCase().trim() === status
                    );

                    return (
                        <DroppableColumn key={status} id={status}>
                            <div className="text-center mb-2">
                                {getStatusTag(status)}
                            </div>
                            {columnTasks.map((task) => (
                                <TaskCard
                                    key={task._id || task.id}
                                    task={task}
                                    onTaskChanged={onTaskChanged}
                                    onDuplicate={onDuplicate}
                                    projectId={projectId}
                                />
                            ))}
                        </DroppableColumn>
                    );
                })}
            </div>

            <DragOverlay>
                {activeTask && (
                    <TaskCard
                        task={activeTask}
                        projectId={projectId}
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default TaskKanbanBoard;
