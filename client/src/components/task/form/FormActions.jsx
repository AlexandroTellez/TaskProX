import { Button, Popconfirm } from 'antd'

/**
 * FormActions - Componente de acciones del formulario de tarea.
 * Incluye botones para crear/actualizar, cancelar y eliminar (solo si se edita y tiene permiso).
 */
const FormActions = ({ isEditing, onCancel, onDelete, canDelete, loading }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Botón de enviar: Crear o Actualizar */}
            <Button
                htmlType="submit"
                block
                loading={loading} // activamos loader y desactivamos
                disabled={loading} // desactiva mientras guarda
                style={{
                    background: '#FFFFFF',
                    borderColor: '#FED36A',
                    color: '#1A1A1A',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                }}
            >
                {loading
                    ? 'Guardando...'
                    : isEditing
                    ? 'Actualizar Tarea'
                    : 'Crear Tarea'}
            </Button>

            {/* Botón de cancelar */}
            <Button
                type="default"
                onClick={onCancel}
                block
                disabled={loading} //bloquear mientras guarda
                style={{
                    background: '#FFFFFF',
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                }}
            >
                Cancelar
            </Button>

            {/* Botón de borrar solo si se está editando y tiene permiso */}
            {isEditing && canDelete && (
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
                        disabled={loading} //Bloquear también mientras guarda
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#ff4d4f',
                            color: '#ff4d4f',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
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
