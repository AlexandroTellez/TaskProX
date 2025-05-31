import { Input, Select, Button, message } from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    ToolOutlined
} from '@ant-design/icons';

const { Option } = Select;

const CollaboratorsSection = ({
    collaborators,
    newCollaborator,
    newPermission,
    setNewCollaborator,
    setNewPermission,
    addCollaborator,
    removeCollaborator,
    updatePermission,
    userPermission // permiso efectivo del usuario ("read", "write", "admin")
}) => {
    // ===================== Mostrar solo si es admin o está en la lista =====================
    const isAdmin = userPermission === 'admin';
    const isCollaborator = collaborators.some(col => col.permission && col.email && col.email !== '' && col.email); // por si hay usuario actual más adelante

    if (!isAdmin && !isCollaborator) return null;

    // ===================== Obtener ID único del colaborador =====================
    const getCollaboratorId = (col) => col._id || col.id || col.email;

    // ===================== Validar y añadir colaborador =====================
    const handleAdd = () => {
        if (!newCollaborator || collaborators.some(col => col.email === newCollaborator)) {
            message.warning("Colaborador inválido o ya existe.");
            return;
        }
        addCollaborator();
    };

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold dark:text-white">Colaboradores</h2>

            {/* ===================== Formulario para añadir colaborador (solo admin) ===================== */}
            {isAdmin && (
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder="Correo del colaborador"
                        value={newCollaborator}
                        onChange={(e) => setNewCollaborator(e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                        <Select
                            value={newPermission}
                            onChange={(val) => setNewPermission(val)}
                            className="flex-1"
                            styles={{
                                popup: { root: { zIndex: 1300 } }
                            }}
                        >
                            <Option value="read"><EyeOutlined /> Ver</Option>
                            <Option value="write"><EditOutlined /> Editar</Option>
                            <Option value="admin"><ToolOutlined /> Administrador</Option>
                        </Select>
                        <Button
                            onClick={handleAdd}
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
                            Añadir
                        </Button>
                    </div>
                </div>
            )}

            {/* ===================== Lista de colaboradores existentes ===================== */}
            {collaborators.length === 0 ? (
                <div className="bg-white text-black dark:bg-[#2a2e33] dark:text-white px-4 py-2 rounded text-center text-sm border border-neutral-600 mt-2">
                    Sin colaboradores asignados
                </div>
            ) : (
                <ul className="mt-2 space-y-2">
                    {collaborators.map((col) => (
                        <li
                            key={getCollaboratorId(col)}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 dark:bg-white text-black p-2 rounded gap-2"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                <span>{col.email}</span>

                                {/* Si es admin puede cambiar permisos */}
                                {isAdmin ? (
                                    <Select
                                        value={col.permission}
                                        onChange={(newPerm) => updatePermission(getCollaboratorId(col), newPerm)}
                                        className="flex-1 sm:w-48"
                                        styles={{
                                            popup: { root: { zIndex: 1300 } }
                                        }}
                                    >
                                        <Option value="read"><EyeOutlined /> Ver</Option>
                                        <Option value="write"><EditOutlined /> Editar</Option>
                                        <Option value="admin"><ToolOutlined /> Administrador</Option>
                                    </Select>
                                ) : (
                                    <span className="text-sm font-medium text-gray-600">
                                        {col.permission === 'read' && 'Ver'}
                                        {col.permission === 'write' && 'Editar'}
                                        {col.permission === 'admin' && 'Administrador'}
                                    </span>
                                )}
                            </div>

                            {/* Solo admin puede eliminar */}
                            {isAdmin && (
                                <Button
                                    danger
                                    size="small"
                                    onClick={() => removeCollaborator(getCollaboratorId(col))}
                                    className="self-end sm:self-auto"
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#ff4d4f',
                                        borderColor: '#ff4d4f',
                                    }}
                                >
                                    Eliminar
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CollaboratorsSection;
