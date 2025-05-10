import { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createProject, fetchProjects } from '../../api/projects';

const CreateProjectButton = ({ onProjectCreated }) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleCreate = async (values) => {
        try {
            await createProject(values);
            message.success('Proyecto creado correctamente');
            closeModal();
            form.resetFields();
            if (onProjectCreated) onProjectCreated(); // Recargar lista
        } catch (error) {
            message.error('Error al crear el proyecto');
            console.error(error);
        }
    };

    return (
        <>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                style={{
                    backgroundColor: '#FED36A',
                    borderColor: '#FED36A',
                    color: '#1A1A1A',
                    fontWeight: 'bold',
                }}
            >
                Crear Proyecto
            </Button>

            <Modal
                title="Nuevo Proyecto"
                open={isModalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText="Crear"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        label="Nombre del Proyecto"
                        name="name"
                        rules={[{ required: true, message: 'El nombre es obligatorio' }]}
                    >
                        <Input placeholder="Ej. TaskProX" />
                    </Form.Item>
                    <Form.Item
                        label="Descripción"
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Describe el proyecto..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CreateProjectButton;
