import { Input, Select, Button, Tag } from 'antd';
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
    updatePermission
}) => {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Colaboradores</h2>

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
                        dropdownStyle={{ zIndex: 1300 }}
                    >
                        <Option value="read"><EyeOutlined /> Ver</Option>
                        <Option value="write"><EditOutlined /> Editar</Option>
                        <Option value="admin"><ToolOutlined /> Administrador</Option>
                    </Select>
                    <Button
                        onClick={addCollaborator}
                        style={{ backgroundColor: '#FED36A', borderColor: '#FED36A', color: '#1A1A1A', fontWeight: 'bold' }}
                    >
                        Añadir
                    </Button>
                </div>
            </div>

            {collaborators.length === 0 ? (
                <div className="bg-white text-black px-4 py-2 rounded text-center text-sm border border-neutral-600 mt-2">
                    Sin colaboradores asignados
                </div>
            ) : (
                <ul className="mt-2 space-y-2">
                    {collaborators.map((col, idx) => (
                        <li
                            key={idx}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-neutral-100 p-2 rounded gap-2"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                <span>{col.email}</span>
                                <Select
                                    value={col.permission}
                                    onChange={(newPerm) => updatePermission(col.email, newPerm)}
                                    className="flex-1 sm:w-48"
                                    dropdownStyle={{ zIndex: 1300 }}
                                >
                                    <Option value="read"><EyeOutlined /> Ver</Option>
                                    <Option value="write"><EditOutlined /> Editar</Option>
                                    <Option value="admin"><ToolOutlined /> Administrador</Option>
                                </Select>
                            </div>
                            <Button
                                danger
                                size="small"
                                onClick={() => removeCollaborator(col.email)}
                                className="self-end sm:self-auto"
                                style={{ fontWeight: 'bold' }}
                            >
                                Eliminar
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CollaboratorsSection;