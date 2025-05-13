import { useState } from 'react';
import {
    Button,
    Modal,
    Form,
    Input,
    message,
    Space,
    Popconfirm,
    ConfigProvider,
    Select,
    Row,
    Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, MinusCircleOutlined } from '@ant-design/icons';
import {
    createProject,
    updateProject,
    deleteProject,
} from '../../api/projects';
import { fetchTasksByProject, createTask } from '../../api/tasks';

const ProjectButton = ({
    selectedProject,
    onProjectUpdated,
    onProjectDeleted,
    onProjectCreated,
}) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const showCreateModal = () => {
        form.resetFields();
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const showEditModal = () => {
        if (!selectedProject) {
            message.warning('Selecciona un proyecto para editar');
            return;
        }

        form.setFieldsValue({
            name: selectedProject.name,
            description: selectedProject.description,
            collaborators: selectedProject.collaborators || [],
        });

        setIsEditing(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (values) => {
        try {
            if (isEditing && selectedProject) {
                const id = selectedProject._id || selectedProject.id;
                await updateProject(id, values);
                message.success('Proyecto actualizado');
                onProjectUpdated?.(id);
            } else {
                await createProject(values);
                message.success('Proyecto creado');
                onProjectCreated?.();
            }
            closeModal();
            form.resetFields();
        } catch (error) {
            message.error('Error al guardar el proyecto');
            console.error(error);
        }
    };

    const handleDuplicate = async () => {
        try {
            if (!selectedProject) {
                return message.warning('Selecciona un proyecto para duplicar');
            }

            const duplicatedProject = {
                name: `${selectedProject.name} (copia)`,
                description: selectedProject.description || '',
                collaborators: selectedProject.collaborators || [],
            };

            const { data: newProject } = await createProject(duplicatedProject);
            message.success('Proyecto duplicado');

            const { data: tasks } = await fetchTasksByProject(selectedProject._id || selectedProject.id);

            for (const task of tasks) {
                const duplicatedTask = {
                    title: `${task.title} (copia)`,
                    description: task.description,
                    creator: task.creator,
                    startDate: task.startDate,
                    deadline: task.deadline,
                    status: task.status || 'Pendiente',
                    projectId: newProject._id || newProject.id,
                };
                await createTask(duplicatedTask);
            }

            message.success('Tareas duplicadas correctamente');
            onProjectCreated?.();

        } catch (error) {
            console.error(error);
            message.error('Error al duplicar el proyecto y sus tareas');
        }
    };

    const handleDelete = async () => {
        try {
            if (!selectedProject) {
                return message.warning('Selecciona un proyecto para eliminar');
            }
            await deleteProject(selectedProject._id || selectedProject.id);
            message.success('Proyecto eliminado');
            onProjectDeleted?.();
        } catch (error) {
            message.error('Error al eliminar el proyecto');
            console.error(error);
        }
    };

    const yellowStyle = {
        backgroundColor: '#FED36A',
        borderColor: '#FED36A',
        color: '#1A1A1A',
        fontWeight: 'bold',
    };

    return (
        <>
            <Space>
                <Button icon={<PlusOutlined />} onClick={showCreateModal} style={yellowStyle}>
                    Crear Proyecto
                </Button>
                <Button icon={<EditOutlined />} onClick={showEditModal} style={yellowStyle}>
                    Editar Proyecto
                </Button>
                <Button
                    onClick={handleDuplicate}
                    icon={<CopyOutlined />}
                    style={{
                        borderColor: '#FED36A',
                        color: '#1A1A1A',
                        fontWeight: 'bold',
                    }}
                >
                    Duplicar Proyecto
                </Button>
                <Popconfirm
                    title="¿Seguro que deseas eliminar este proyecto?"
                    onConfirm={handleDelete}
                    okText="Sí"
                    cancelText="No"
                >
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        style={{
                            ...yellowStyle,
                            background: '#FFFFFF',
                            borderColor: '#ff4d4f',
                            color: '#ff4d4f',
                            fontWeight: 'bold',
                        }}
                    >
                        Borrar Proyecto
                    </Button>
                </Popconfirm>
            </Space>

            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#FED36A',
                        colorText: '#1A1A1A',
                        colorPrimaryTextHover: '#1A1A1A',
                        colorTextLightSolid: '#1A1A1A',
                    },
                    components: {
                        Button: {
                            defaultBg: '#FFFFFF',
                            defaultColor: '#1A1A1A',
                            defaultBorderColor: '#D9D9D9',
                            defaultHoverColor: '#1A1A1A',
                            defaultHoverBg: '#f5f5f5',
                        },
                    },
                }}
            >
                <Modal
                    title={isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    open={isModalOpen}
                    onCancel={closeModal}
                    onOk={() => form.submit()}
                    okText={isEditing ? 'Guardar' : 'Crear'}
                    cancelText="Cancelar"
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            label="Nombre del Proyecto"
                            name="name"
                            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
                        >
                            <Input placeholder="Ej. TaskProX" />
                        </Form.Item>

                        <Form.Item label="Descripción" name="description">
                            <Input.TextArea rows={3} placeholder="Describe el proyecto..." />
                        </Form.Item>

                        <Form.List name="collaborators">
                            {(fields, { add, remove }) => (
                                <>
                                    <label className="block text-sm font-medium mb-2">
                                        Colaboradores
                                    </label>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row gutter={8} key={key} className="mb-2">
                                            <Col span={14}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'email']}
                                                    rules={[{ required: true, message: 'Email requerido' }]}
                                                >
                                                    <Input placeholder="Email del colaborador" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'permission']}
                                                    rules={[{ required: true, message: 'Permiso requerido' }]}
                                                >
                                                    <Select placeholder="Permiso">
                                                        <Select.Option value="read">Ver</Select.Option>
                                                        <Select.Option value="write">Editar</Select.Option>
                                                        <Select.Option value="admin">Administrador</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                    className="text-red-500 mt-2 cursor-pointer"
                                                />
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block>
                                            + Añadir colaborador
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Modal>
            </ConfigProvider>
        </>
    );
};

export default ProjectButton;
