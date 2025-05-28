import { Table, Tag, Button, Popconfirm, Space, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPermission, getStatusTag, formatDate } from './utils.jsx';

function descargarArchivo(file) {
    try {
        if (!file || !file.data || typeof file.data !== "string") {
            console.error("Archivo inválido o sin contenido base64:", file);
            return;
        }

        let base64Data = file.data;

        // Detectar y eliminar encabezado data:<tipo>;base64,
        const base64Match = file.data.match(/^data:(.*);base64,(.*)$/);
        if (base64Match) {
            base64Data = base64Match[2];
        }

        // Decodificar base64
        const byteCharacters = atob(base64Data.trim());
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

        // Si el nombre empieza con punto, lo ajustamos
        let safeFileName = file.name || 'archivo';
        if (safeFileName.startsWith('.')) {
            safeFileName = `descarga_${safeFileName.replace(/^\.+/, '')}`;
            console.warn(`Nombre de archivo modificado para la descarga: ${safeFileName}`);
        }

        // Descargar
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error al intentar descargar el archivo:', error);
    }
}


const TaskTable = ({ tasks, userEmail, onDuplicate, onDelete, projectId }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: <div className="text-center w-full dark:text-white">Título</div>,
            dataIndex: 'title',
            key: 'title',
            render: (text) => <div className="text-left font-bold dark:text-white">{text}</div>,
        },
        {
            title: <div className="text-center w-full dark:text-white">Creador</div>,
            dataIndex: 'creator_name',
            key: 'creator_name',
            render: (creatorName) => (
                <div className="text-left text-black dark:text-white">
                    {creatorName || 'Sin creador'}
                </div>
            ),
        },
        {
            title: <div className="text-center w-full dark:text-white">Colaboradores</div>,
            dataIndex: 'collaborators',
            key: 'collaborators',
            render: (collaborators) => {
                if (!collaborators || collaborators.length === 0) {
                    return <div className="text-left dark:text-white">Ninguno</div>;
                }
                return (
                    <div className="text-left space-x-1">
                        {collaborators.map((col, index) => (
                            <Tag
                                key={index}
                                color={
                                    col.permission === 'admin'
                                        ? 'red'
                                        : col.permission === 'write'
                                            ? 'blue'
                                            : 'default'
                                }
                            >
                                {col.email} ({col.permission})
                            </Tag>
                        ))}
                    </div>
                );
            },
        },
        {
            title: <div className="text-center w-full dark:text-white">Fecha Inicio</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => <div className="text-left dark:text-white">{formatDate(date)}</div>,
        },
        {
            title: <div className="text-center w-full dark:text-white">Fecha Límite</div>,
            dataIndex: 'deadline',
            key: 'deadline',
            render: (date) => <div className="text-left dark:text-white">{formatDate(date)}</div>,
        },
        {
            title: <div className="text-center w-full dark:text-white">Estado</div>,
            dataIndex: 'status',
            key: 'status',
            render: (status) => <div className="text-left">{getStatusTag(status)}</div>,
        },
        {
            title: <div className="text-center w-full dark:text-white">Archivos</div>,
            dataIndex: 'recurso',
            key: 'recurso',
            render: (recurso) => {
                if (!recurso || recurso.length === 0) {
                    return <div className="text-left dark:text-white">Ninguno</div>;
                }

                return (
                    <ul className="list-disc list-inside text-left text-blue-500 dark:text-blue-400">
                        {recurso.map((file, index) => (
                            <li key={index}>
                                <Button
                                    type="link"
                                    className="underline break-words px-0 text-blue-500 dark:text-blue-300"
                                    icon={<DownloadOutlined />}
                                    onClick={() => {
                                        descargarArchivo(file);
                                    }}
                                >
                                    {file.name}
                                </Button>
                            </li>
                        ))}
                    </ul>
                );
            }
        },
        {
            title: <div className="text-center w-full dark:text-white">Acciones</div>,
            key: 'acciones',
            align: 'center',
            render: (_, record) => {
                const permission = getPermission(record, userEmail);
                return (
                    <Space wrap>
                        {(permission === 'write' || permission === 'admin') && (
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/tasks/${record.id}/edit?projectId=${projectId}`)}
                                style={{
                                    backgroundColor: '#FED36A',
                                    borderColor: '#FED36A',
                                    color: '#1A1A1A',
                                    fontWeight: 'bold',
                                }}
                            >
                                Editar
                            </Button>
                        )}
                        {['read', 'write', 'admin'].includes(permission) && (
                            <Button
                                onClick={() => onDuplicate(record)}
                                icon={<CopyOutlined />}
                                style={{
                                    borderColor: '#FED36A',
                                    color: '#1A1A1A',
                                    fontWeight: 'bold',
                                }}
                            >
                                Duplicar
                            </Button>
                        )}
                        {permission === 'admin' && (
                            <Popconfirm
                                title="¿Estás seguro de borrar esta tarea?"
                                onConfirm={() => onDelete(record.id)}
                                okText="Sí"
                                cancelText="No"
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    style={{
                                        borderColor: '#ff4d4f',
                                        color: '#ff4d4f',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Borrar
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    const tableData = tasks.map((task) => ({
        key: task._id,
        id: task.id || task._id,
        title: task.title || 'Sin título',
        description: task.description || '',
        creator: task.creator || '',
        creator_name: task.creator_name || 'Desconocido',
        startDate: task.startDate,
        deadline: task.deadline,
        status: task.status || '',
        collaborators: task.collaborators || [],
        effective_permission: task.effective_permission || null,
        recurso: task.recurso || []
    }));

    return (
        <div className="overflow-x-auto rounded-md border dark:border-[#FFFFFF] shadow bg-white dark:bg-[#2a2e33]">
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                expandable={{
                    expandedRowRender: (record) => (
                        <div
                            className="prose max-w-none text-black dark:text-white dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: record.description }}
                        />
                    ),
                    rowExpandable: (record) => record.description && record.description.length > 0,
                }}
                scroll={{ x: true }}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                <span className="font-semibold text-white">
                                    No hay tareas disponibles
                                </span>
                            }
                        />
                    ),
                }}
            />
        </div>
    );
};

export default TaskTable;
