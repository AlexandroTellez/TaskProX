import { Button, Popconfirm } from 'antd';

const FormActions = ({ isEditing, onCancel, onDelete }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
                htmlType="submit"
                block
                style={{
                    background: '#FFFFFF',
                    borderColor: '#FED36A',
                    color: '#1A1A1A',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '6px',
                }}
            >
                {isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
            </Button>

            <Button
                type="default"
                onClick={onCancel}
                block
                style={{
                    background: '#FFFFFF',
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '6px',
                }}
            >
                Cancelar
            </Button>

            {isEditing && (
                <Popconfirm
                    title="¿Seguro que deseas eliminar esta tarea?"
                    onConfirm={onDelete}
                    okText="Sí"
                    cancelText="No"
                >
                    <Button
                        danger
                        block
                        className="mt-6 sm:mt-0"
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#ff4d4f',
                            color: '#ff4d4f',
                            fontWeight: 'bold',
                        }}
                    >
                        Borrar Tarea
                    </Button>
                </Popconfirm>
            )}
        </div>
    );
};

export default FormActions;