import { Button, Popconfirm } from 'antd';

const FormActions = ({ isEditing, onCancel, onDelete }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
                htmlType="submit"
                block
                style={{
                    backgroundColor: '#FED36A',
                    borderColor: '#FED36A',
                    color: '#1A1A1A',
                    fontWeight: 'bold'
                }}
            >
                {isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
            </Button>

            <Button
                type="default"
                onClick={onCancel}
                block
                style={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid #D1D5DB',
                    fontWeight: 'bold'
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
                            fontWeight: 'bold',
                            backgroundColor: 'transparent',
                            borderColor: '#ff4d4f'
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