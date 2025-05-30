import { useEffect } from 'react';
import { Select, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';

const { Option } = Select;

const ProjectSelector = ({ projects = [], selectedProject, setSelectedProject }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Función segura para obtener el ID del proyecto (ya sea id o _id)
    const getProjectId = (project) => project?.id || project?._id;

    // Al cargar o actualizar los proyectos, selecciona el proyecto según el parámetro de la URL
    useEffect(() => {
        const projectId = searchParams.get('projectId');

        if (projectId && !selectedProject && Array.isArray(projects)) {
            const matched = projects.find(p => getProjectId(p) === projectId);
            if (matched) {
                setSelectedProject(matched);
            }
        }
    }, [projects, selectedProject, setSelectedProject, searchParams]);

    // ===================== Manejar cambio en selector =====================
    const handleChange = (value) => {
        if (!Array.isArray(projects)) return;

        const selected = projects.find(p => getProjectId(p) === value);
        if (!selected || !getProjectId(selected)) return;

        setSelectedProject(selected);
        setSearchParams({ projectId: getProjectId(selected) });
    };

    return (
        <div className="mb-4">
            {/* ===================== Título selector ===================== */}
            <div className="flex items-center gap-2">
                <Typography.Text strong className="underline text-sm text-black dark:text-white">
                    SELECCIONA UN PROYECTO:
                </Typography.Text>
                <DownOutlined className="text-neutral-500 dark:text-white" style={{ fontSize: '12px' }} />
            </div>

            {/* ===================== Selector de proyectos ===================== */}
            <Select
                placeholder="Selecciona un proyecto"
                value={
                    selectedProject && getProjectId(selectedProject)
                        ? getProjectId(selectedProject)
                        : undefined
                }
                onChange={handleChange}
                style={{ width: '100%', marginTop: 8 }}
            >
                {projects
                    .filter(project => getProjectId(project)) // Filtrar proyectos sin ID válido
                    .map(project => (
                        <Option key={getProjectId(project)} value={getProjectId(project)}>
                            {project.name}
                        </Option>
                    ))}
            </Select>
        </div>
    );
};

export default ProjectSelector;
