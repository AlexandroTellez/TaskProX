import { useState } from 'react';
import {
    Button,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    ConfigProvider,
    Select,
    Row,
    Col,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CopyOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';

import {
    createProject,
    updateProject,
    deleteProject,
} from '../../api/projects';
import {
    fetchTasksByProject,
    createTask,
} from '../../api/tasks';

const ProjectButton = ({
    selectedProject,
    onProjectUpdated,
    onProjectDeleted,
    onProjectCreated,
}) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // ===================== Obtener ID seguro del proyecto =====================
    const getProjectId = (project) => project?._id || project?.id;

    // ===================== Modal de creación =====================
    const showCreateModal = () => {
        form.resetFields();
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // ===================== Modal de edición =====================
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

    // ===================== Cerrar modal =====================
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // ===================== Crear o actualizar proyecto =====================
    const handleSubmit = async (values) => {
        try {
            if (isEditing && selectedProject) {
                const id = getProjectId(selectedProject);
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

    // ===================== Duplicar proyecto y tareas =====================
    const handleDuplicate = async () => {
        if (!selectedProject) {
            return message.warning('Selecciona un proyecto para duplicar');
        }

        try {
            const duplicatedProject = {
                name: `${selectedProject.name} (copia)`,
                description: selectedProject.description || '',
                collaborators: selectedProject.collaborators || [],
            };

            const { data: newProject } = await createProject(duplicatedProject);
            message.success('Proyecto duplicado');

            const { data: tasks } = await fetchTasksByProject(getProjectId(selectedProject));

            for (const task of tasks) {
                const duplicatedTask = {
                    title: `${task.title} (copia)`,
                    description: task.description,
                    creator: task.creator,
                    startDate: task.startDate,
                    deadline: task.deadline,
                    status: task.status || 'pendiente',
                    projectId: getProjectId(newProject),
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

    // ===================== Eliminar proyecto =====================
    const handleDelete = async () => {
        if (!selectedProject) {
            return message.warning('Selecciona un proyecto para eliminar');
        }

        try {
            const id = getProjectId(selectedProject);
            if (!id || typeof id !== 'string') {
                console.error('ID de proyecto no válido:', id);
                return message.error('Error: ID del proyecto no válido');
            }

            await deleteProject(id);
            message.success('Proyecto eliminado');
            onProjectDeleted?.();
        } catch (error) {
            message.error('Error al eliminar el proyecto');
            console.error(error);
        }
    };

    // ===================== Estilos comunes =====================
    const yellowStyle = {
        background: '#FFFFFF',
        borderColor: '#FED36A',
        color: '#1A1A1A',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '6px',
    };

    // ===================== Render UI =====================
    return (
        <>
            {/* ====== Botones principales ====== */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center sm:justify-start">
                <Button icon={<PlusOutlined />} onClick={showCreateModal} style={yellowStyle}>
                    Crear Proyecto
                </Button>
                <Button icon={<EditOutlined />} onClick={showEditModal} style={yellowStyle}>
                    Editar Proyecto
                </Button>
                <Button
                    icon={<CopyOutlined />}
                    onClick={handleDuplicate}
                    style={{
                        background: '#FFFFFF',
                        borderColor: '#6D28D9',
                        color: '#6D28D9',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '6px',
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
                        }}
                    >
                        Borrar Proyecto
                    </Button>
                </Popconfirm>
            </div>

            {/* ====== Modal de creación/edición ====== */}
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#FED36A',
                        colorText: '#1A1A1A',
                        colorPrimaryTextHover: '#1A1A1A',
                        colorTextLightSolid: '#1A1A1A',
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
                        {/* Nombre */}
                        <Form.Item
                            label="Nombre del Proyecto"
                            name="name"
                            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
                        >
                            <Input placeholder="Ej. TaskProX" />
                        </Form.Item>

                        {/* Descripción */}
                        <Form.Item label="Descripción" name="description">
                            <Input.TextArea rows={3} placeholder="Describe el proyecto..." />
                        </Form.Item>

                        {/* Colaboradores */}
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
