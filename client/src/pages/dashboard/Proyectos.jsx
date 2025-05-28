import { AppstoreOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Empty, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../../api/projects';
import { fetchTasksByProject, deleteTask, createTask } from '../../api/tasks';
import CreateProjectButton from '../../components/project/ProjectButton';
import ProjectSelector from '../../components/project/ProjectSelector';
import TaskList from '../../components/task/TaskList';
import TaskKanbanBoard from '../../components/task/list/TaskKanbanBoard';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

const Proyectos = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isKanbanView, setIsKanbanView] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.email || '';

    const loadProjects = async () => {
        try {
            const res = await fetchProjects();
            setProjects(res.data);
            return res.data;
        } catch (err) {
            console.error('Error al cargar proyectos:', err);
            return [];
        }
    };

    const loadTasks = async (projectId) => {
        try {
            const res = await fetchTasksByProject(projectId);
            if (Array.isArray(res.data)) {
                setTasks(res.data);
            } else {
                setTasks([]);
            }
        } catch (err) {
            console.error('Error al obtener tareas:', err);
            setTasks([]);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject?._id) {
            loadTasks(selectedProject._id);
        } else {
            setTasks([]);
        }
    }, [selectedProject]);

    const handleStatusChange = (taskId, newStatus) => {
        const updatedTasks = tasks.map(task =>
            (task._id === taskId || task.id === taskId)
                ? { ...task, status: newStatus }
                : task
        );
        setTasks(updatedTasks);
        // Puedes llamar a la API aquí si quieres persistir el cambio en el backend
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            if (selectedProject?._id) loadTasks(selectedProject._id);
        } catch {
            message.error('Error al eliminar la tarea');
        }
    };

    const handleDuplicate = async (record) => {
        try {
            const userFullName = `${user?.nombre} ${user?.apellidos}`;
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
                projectId: selectedProject._id,
                creator: userEmail,
                creator_name: userFullName,
            };

            await createTask(duplicatedTask);
            message.success('Tarea duplicada correctamente');
            if (selectedProject?._id) loadTasks(selectedProject._id);
        } catch (error) {
            console.error('Error al duplicar:', error);
            message.error('Error al duplicar la tarea');
        }
    };

    return (
        <div className="w-full bg-gray-100 dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4 overflow-x-auto overflow-y-visible ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Title level={3} className="text-black dark:text-white m-0 !leading-snug !text-lg sm:!text-xl md:!text-2xl lg:!text-3xl whitespace-nowrap">
                    GESTIÓN DE PROYECTOS
                    <div className="text-xs sm:text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1 whitespace-normal">
                        FLUJO DE TRABAJO - PROYECTOS Y TAREAS
                    </div>
                </Title>

                <CreateProjectButton
                    selectedProject={selectedProject}
                    onProjectCreated={loadProjects}
                    onProjectUpdated={async (updatedId) => {
                        const updatedProjects = await loadProjects();
                        const updatedProject = updatedProjects.find(p => p._id === updatedId);
                        if (updatedProject) setSelectedProject(updatedProject);
                    }}
                    onProjectDeleted={() => {
                        setSelectedProject(null);
                        setTasks([]);
                        loadProjects();
                    }}
                />
            </div>

            <div className="mb-6">
                <ProjectSelector
                    projects={projects}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                />
            </div>

            {selectedProject ? (
                <>
                    {selectedProject.description && (
                        <Paragraph className="italic text-sm text-black dark:text-white mb-4">
                            <span className="underline font-medium">Descripción del proyecto:</span> {selectedProject.description}
                        </Paragraph>
                    )}

                    {selectedProject.collaborators && selectedProject.collaborators.length > 0 ? (
                        <Paragraph className="text-sm text-black dark:text-white mb-4">
                            <span className="underline font-medium">Colaboradores:</span>
                            <ul className="mt-1 list-disc list-inside">
                                {selectedProject.collaborators.map((colab, index) => (
                                    <li key={index}>
                                        {colab.name || colab.email} {colab.email && colab.name ? `- ${colab.email}` : ''}
                                    </li>
                                ))}
                            </ul>
                        </Paragraph>
                    ) : (
                        <Paragraph className="text-sm text-black dark:text-white mb-4">
                            <span className="underline font-medium">Colaboradores:</span> sin colaboradores
                        </Paragraph>
                    )}

                    <div className="flex justify-between flex-wrap items-center gap-3 mb-4">
                        <Button
                            onClick={() => setIsKanbanView(!isKanbanView)}
                            icon={isKanbanView ? <TableOutlined /> : <AppstoreOutlined />}
                            style={{
                                background: '#FFFFFF',
                                borderColor: '#6B7280',
                                color: '#6B7280',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                            }}
                        >
                            {isKanbanView ? 'Vista Tabla' : 'Vista Kanban'}
                        </Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/tasks/new?projectId=${selectedProject._id}`)}
                            style={{
                                background: '#FFFFFF',
                                borderColor: '#FED36A',
                                color: '#1A1A1A',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                                borderWidth: '2px'
                            }}
                        >
                            Crear Tarea
                        </Button>
                    </div>

                    <div className="rounded-md border dark:border-[#FFFFFF] shadow-md dark:bg-[#2a2e33] p-4 overflow-x-auto overflow-y-visible min-h-[400px]">
                        {isKanbanView ? (
                            <TaskKanbanBoard
                                tasks={tasks}
                                userEmail={userEmail}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                                projectId={selectedProject._id}
                            />
                        ) : (
                            <TaskList
                                tasks={tasks}
                                projectId={selectedProject._id}
                                onTaskChanged={() => loadTasks(selectedProject._id)}
                            />
                        )}
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center mt-12">
                    <div className="text-center">
                        <Empty
                            description={
                                <span className="text-neutral-700 dark:text-white">
                                    Selecciona un proyecto para ver sus tareas
                                </span>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proyectos;
