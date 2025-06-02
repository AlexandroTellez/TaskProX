import { AppstoreOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Empty, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProjects } from '../../api/projects';
import {
    fetchTasksByProject,
    fetchTasksForCollaboratorByProject,
    deleteTask,
    createTask
} from '../../api/tasks';
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
    const [searchParams, setSearchParams] = useSearchParams(); // <-- para leer/escribir en la URL
    const navigate = useNavigate();

    // Leer el modo de vista desde la URL (?view=kanban)
    const viewMode = searchParams.get("view");
    const [isKanbanView, setIsKanbanView] = useState(viewMode === "kanban");

    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.email || '';

    const getProjectId = (project) => project?._id || project?.id;
    const selectedProjectId = getProjectId(selectedProject);

    const loadProjects = async () => {
        try {
            const filters = {
                user_id: user?._id || '',
                user_email: user?.email || '',
            };
            const projects = await fetchProjects(filters);

            setProjects(projects);

            const urlProjectId = searchParams.get('projectId');
            if (!selectedProject && projects.length > 0) {
                const found = projects.find(p => getProjectId(p) === urlProjectId);
                setSelectedProject(found || projects[0]);
            }

            return projects;
        } catch (err) {
            console.error('Error al cargar proyectos:', err);
            return [];
        }
    };

    const loadTasks = async (projectId) => {
        if (!projectId || typeof projectId !== 'string' || projectId.toLowerCase() === 'none') {
            console.warn('ID de proyecto inválido para cargar tareas:', projectId);
            setTasks([]);
            return;
        }

        try {
            const isProjectMember =
                selectedProject?.collaborators?.some(c => c.email === userEmail) ||
                selectedProject?.user_email === userEmail;

            let tasksData = [];

            if (isProjectMember) {
                const res = await fetchTasksByProject(projectId);
                tasksData = Array.isArray(res.data) ? res.data : [];
            } else {
                const res = await fetchTasksForCollaboratorByProject(projectId);
                tasksData = Array.isArray(res.data) ? res.data : [];
            }

            setTasks(tasksData);
        } catch (err) {
            console.error('Error al obtener tareas:', err);
            setTasks([]);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject && selectedProjectId && typeof selectedProjectId === 'string') {
            loadTasks(selectedProjectId);
        } else {
            setTasks([]);
        }
    }, [selectedProject, selectedProjectId]);

    const handleStatusChange = (taskId, newStatus) => {
        const updatedTasks = tasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        );
        setTasks(updatedTasks);
    };

    const updateTaskInLocalState = (updatedTask) => {
        if (!updatedTask || !updatedTask._id) return;

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task._id === updatedTask._id ? updatedTask : task
            )
        );
    };


    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            message.success('Tarea eliminada');
            if (selectedProjectId) loadTasks(selectedProjectId);
        } catch {
            message.error('Error al eliminar la tarea');
        }
    };

    const handleDuplicate = async (record) => {
        try {
            const userFullName = [user?.nombre, user?.apellidos].filter(Boolean).join(' ');

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
                projectId: selectedProjectId,
                creator: userEmail,
                creator_name: userFullName,
            };

            await createTask(duplicatedTask);
            message.success('Tarea duplicada correctamente');

            if (selectedProjectId) loadTasks(selectedProjectId);
        } catch (error) {
            console.error('Error al duplicar:', error);
            message.error('Error al duplicar la tarea');
        }
    };

    // Cambiar entre vista Kanban y Tabla y actualizar la URL
    const toggleView = () => {
        const newView = !isKanbanView;
        setIsKanbanView(newView);
        searchParams.set("view", newView ? "kanban" : "tabla");
        setSearchParams(searchParams); // <-- actualiza la URL
    };

    return (
        <div className="min-w-full bg-gray-100 dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4 overflow-x-auto overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Title
                    level={3}
                    className="text-black dark:text-white m-0 !leading-snug !text-lg sm:!text-xl md:!text-2xl lg:!text-3xl whitespace-nowrap"
                >
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
                        const updatedProject = updatedProjects.find(p => getProjectId(p) === updatedId);
                        if (updatedProject) setSelectedProject(updatedProject);
                    }}
                    onProjectDeleted={async () => {
                        setSelectedProject(null);
                        setTasks([]);
                        const updatedProjects = await loadProjects();
                        if (updatedProjects.length > 0) {
                            setSelectedProject(updatedProjects[0]);
                            loadTasks(getProjectId(updatedProjects[0]));
                        }
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

                    <Paragraph className=" italic text-sm text-black dark:text-white mb-4">
                        <span className="underline font-medium">Colaboradores:</span>
                        {selectedProject.collaborators?.length > 0 ? (
                            <ul className="mt-1 list-disc list-inside">
                                {selectedProject.collaborators.map((colab, index) => (
                                    <li key={index}>
                                        {colab.name || colab.email}
                                        {colab.email && colab.name ? ` - ${colab.email}` : ''}
                                        {colab.permission ? ` (${colab.permission})` : ''}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <> sin colaboradores. </>
                        )}
                    </Paragraph>

                    <div className="flex justify-between flex-wrap items-center gap-3 mb-4">
                        <Button
                            onClick={toggleView}
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
                            onClick={() => {
                                if (selectedProjectId) {
                                    let permission = 'read';
                                    if (selectedProject.user_email === userEmail) {
                                        permission = 'admin';
                                    } else {
                                        const colaborador = selectedProject.collaborators?.find(c => c.email === userEmail);
                                        if (colaborador?.permission) {
                                            permission = colaborador.permission;
                                        }
                                    }

                                    navigate(`/tasks/new?projectId=${selectedProjectId}&projectPermission=${permission}`);
                                } else {
                                    message.warning('Proyecto no válido para crear tarea.');
                                }
                            }}
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

                    <div className="w-full rounded-md border dark:border-[#FFFFFF] shadow-md dark:bg-[#2a2e33] p-4 overflow-x-hidden min-h-[400px]">
                        {isKanbanView ? (
                            <TaskKanbanBoard
                                tasks={tasks}
                                userEmail={userEmail}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                                projectId={selectedProjectId}
                                onTaskChanged={updateTaskInLocalState}
                            />
                        ) : (
                            <TaskList
                                tasks={tasks}
                                projectId={selectedProjectId}
                                onTaskChanged={() => loadTasks(selectedProjectId)}
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
                                    Selecciona un proyecto para ver sus tareas.
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
