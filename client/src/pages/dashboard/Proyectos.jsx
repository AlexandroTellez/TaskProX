import React, { useState, useEffect } from 'react';
import { Typography, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import ProjectSelector from '../../components/project/ProjectSelector';
import CreateProjectButton from '../../components/project/ProjectButton';
import TaskList from '../../components/task/TaskList';
import { fetchTasksByProject } from '../../api/tasks';
import { fetchProjects } from '../../api/projects';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Proyectos = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

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

    return (
        <div className="w-full bg-white text-black dark:bg-[#1A1A1A] dark:text-white p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Title level={3} className="text-black dark:text-white m-0">GESTION DE PROYECTOS
                    <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1"> FLUJO DE TRABAJO - PROYECTOS Y TAREAS </p>
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

                    <div className="flex justify-end mb-4">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/tasks/new?projectId=${selectedProject._id}`)}
                            style={{
                                backgroundColor: '#FED36A',
                                borderColor: '#FED36A',
                                color: '#1A1A1A',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                            }}
                        >
                            Crear Tarea
                        </Button>
                    </div>

                    <div className="rounded-md border dark:border-[#FED36A] shadow-md dark:bg-[#2a2e33] p-4">
                        <TaskList
                            tasks={tasks}
                            projectId={selectedProject._id}
                            onTaskChanged={() => loadTasks(selectedProject._id)}
                        />
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
