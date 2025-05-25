import { useEffect } from 'react';
import { Select, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';


const { Option } = Select;

const ProjectSelector = ({ projects, selectedProject, setSelectedProject }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const projectId = searchParams.get('projectId');
        if (projectId && !selectedProject) {
            const matched = projects.find(p => p.id === projectId || p._id === projectId);
            if (matched) {
                setSelectedProject(matched);
            }
        }
    }, [projects, selectedProject, setSelectedProject, searchParams]);

    const handleChange = (value) => {
        const selected = projects.find((p) => p.id === value || p._id === value);
        if (!selected) return;

        setSelectedProject(selected);

        const id = selected.id || selected._id;
        setSearchParams({ projectId: id });
    };

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2">
                <Typography.Text strong className=" underline text-sm text-black dark:text-white">
                    SELECCIONA UN PROYECTO:
                </Typography.Text>
                <DownOutlined className="text-neutral-500 dark:text-white" style={{ fontSize: '12px' }} />
            </div>
            <Select
                placeholder="Selecciona un proyecto"
                value={selectedProject?.id || selectedProject?._id || undefined}
                onChange={handleChange}
                style={{ width: '100%', marginTop: 8 }}
            >
                {projects.map((project) => (
                    <Option key={project.id || project._id} value={project.id || project._id}>
                        {project.name}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default ProjectSelector;
