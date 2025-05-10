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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    createProject,
    updateProject,
    deleteProject,
} from '../../api/projects';

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
                await updateProject(selectedProject._id || selectedProject.id, values);
                message.success('Proyecto actualizado');
                onProjectUpdated?.();
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
                            backgroundColor: '#ff4d4f',
                            borderColor: '#ff4d4f',
                            color: '#fff',
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
                    </Form>
                </Modal>
            </ConfigProvider>
        </>
    );
};

export default ProjectButton;
