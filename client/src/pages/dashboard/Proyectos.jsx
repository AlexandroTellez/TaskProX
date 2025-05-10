import React, { useState, useEffect } from 'react';
import { Typography, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import ProjectSelector from '../../components/project/ProjectSelector';
import CreateProjectButton from '../../components/project/ProjectButton';
import TaskList from '../../components/task/TaskList';
import { fetchTasksByProject } from '../../api/tasks';
import { fetchProjects } from '../../api/projects';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Proyectos = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

    const loadProjects = async () => {
        try {
            const res = await fetchProjects();
            setProjects(res.data);
        } catch (err) {
            console.error('Error al cargar proyectos:', err);
        }
    };

    const loadTasks = async (projectId) => {
        try {
            const res = await fetchTasksByProject(projectId);
            setTasks(res.data);
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
        <div className="p-6 bg-white text-black rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <Title level={3} className="!mb-0 text-black">Gestión de Proyectos</Title>
                <CreateProjectButton
                    selectedProject={selectedProject}
                    onProjectCreated={loadProjects}
                    onProjectUpdated={loadProjects}
                    onProjectDeleted={() => {
                        setSelectedProject(null);
                        loadProjects();
                        setTasks([]);
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
                    <div className="mb-4">
                        {selectedProject.description && (
                            <Typography.Paragraph className="italic text-sm text-neutral-700 mt-1">
                                <span className="underline font-medium">Descripción del proyecto:</span> {selectedProject.description}
                            </Typography.Paragraph>
                        )}
                    </div>

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
                            }}
                        >
                            Crear Tarea
                        </Button>
                    </div>

                    {tasks.length > 0 ? (
                        <TaskList
                            tasks={tasks}
                            projectId={selectedProject._id}
                            onTaskChanged={() => loadTasks(selectedProject._id)}
                        />
                    ) : (
                        <Empty description="Este proyecto no tiene tareas aún" />
                    )}
                </>
            ) : (
                <Empty description="Selecciona un proyecto para ver sus tareas" className="mt-12" />
            )}
        </div>
    );
};

export default Proyectos;
