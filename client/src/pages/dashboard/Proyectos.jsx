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
        <div className="w-full bg-white text-black dark:bg-[#1A1A1A] dark:text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <Title level={3} className="!mb-0 dark:text-white">Gestión de Proyectos</Title>

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
                        <Paragraph className="italic text-sm text-neutral-700 dark:text-neutral-300 mb-4">
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

                    <TaskList
                        tasks={tasks}
                        projectId={selectedProject._id}
                        onTaskChanged={() => loadTasks(selectedProject._id)}
                    />
                </>
            ) : (
                <Empty description="Selecciona un proyecto para ver sus tareas" className="mt-12" />
            )}
        </div>
    );
};

export default Proyectos;
