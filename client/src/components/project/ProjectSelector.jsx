import { Select, Typography } from 'antd';

const { Option } = Select;

const ProjectSelector = ({ projects, selectedProject, setSelectedProject }) => {
    return (
        <div className="mb-4">
            <Typography.Text strong className='underline text-sm text-neutral-700'>
                Elige tu proyecto:
            </Typography.Text>
            <Select
                placeholder="Selecciona un proyecto"
                value={selectedProject?.id || undefined}
                onChange={(value) => {
                    const selected = projects.find((p) => p.id === value);
                    setSelectedProject(selected);
                }}
                style={{ width: '100%', marginTop: 8 }}
            >
                {projects.map((project) => (
                    <Option key={project.id} value={project.id}>
                        {project.name}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default ProjectSelector;
