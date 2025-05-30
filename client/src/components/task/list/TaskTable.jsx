import { DownloadOutlined } from '@ant-design/icons';
import { Button, Empty, Table, Tag } from 'antd';
import { formatDate, getStatusTag } from './utils.jsx';
import TaskActions from './TaskActions';
import { getPermission } from './utils.jsx';

// ===================== Función para descarga de archivos base64 =====================
function descargarArchivo(file) {
    try {
        if (!file || !file.data || typeof file.data !== 'string') {
            console.error('Archivo inválido o sin contenido base64:', file);
            return;
        }

        let base64Data = file.data;
        const base64Match = file.data.match(/^data:(.*);base64,(.*)$/);
        if (base64Match) {
            base64Data = base64Match[2];
        }

        const byteCharacters = atob(base64Data.trim());
        const byteArray = new Uint8Array(
            Array.from(byteCharacters, (char) => char.charCodeAt(0))
        );
        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

        let safeFileName = file.name || 'archivo';
        if (safeFileName.startsWith('.')) {
            safeFileName = `descarga_${safeFileName.replace(/^\.+/, '')}`;
            console.warn(`Nombre de archivo modificado para la descarga: ${safeFileName}`);
        }

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

// ===================== Componente principal =====================
const TaskTable = ({ tasks, userEmail, onDuplicate, onDelete, projectId }) => {
    const columns = [
        {
            title: <div className="text-center w-full dark:text-white">Título</div>,
            dataIndex: 'title',
            key: 'title',
            render: (text) => (
                <div className="text-left font-bold dark:text-white">{text}</div>
            ),
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
                if (!Array.isArray(collaborators) || collaborators.length === 0) {
                    return <div className="text-left dark:text-white">Ninguno</div>;
                }

                return (
                    <div className="text-left space-x-1">
                        {collaborators.map((col) => (
                            <Tag
                                key={col.email}
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
            render: (date) => (
                <div className="text-left dark:text-white">{formatDate(date)}</div>
            ),
        },
        {
            title: <div className="text-center w-full dark:text-white">Fecha Límite</div>,
            dataIndex: 'deadline',
            key: 'deadline',
            render: (date) => (
                <div className="text-left dark:text-white">{formatDate(date)}</div>
            ),
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
                if (!Array.isArray(recurso) || recurso.length === 0) {
                    return <div className="text-left dark:text-white">Ninguno</div>;
                }

                return (
                    <ul className="list-disc list-inside text-left text-blue-500 dark:text-blue-400">
                        {recurso.map((file) => (
                            <li key={file.name}>
                                <Button
                                    type="link"
                                    className="underline break-words px-0 text-blue-500 dark:text-blue-300"
                                    icon={<DownloadOutlined />}
                                    onClick={() => descargarArchivo(file)}
                                >
                                    {file.name}
                                </Button>
                            </li>
                        ))}
                    </ul>
                );
            },
        },
        {
            title: <div className="text-center w-full dark:text-white">Acciones</div>,
            key: 'acciones',
            align: 'center',
            render: (_, task) => {
                const permission = getPermission(task, userEmail);
                return (
                    <TaskActions
                        task={task}
                        userEmail={userEmail}
                        projectId={projectId}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        permission={permission}
                        className="flex flex-wrap gap-2 mt-3 w-full justify-start"
                    />
                );
            },
        },
    ];

    const tableData = tasks.map((task) => ({
        ...task,
        key: task._id,
        permission: getPermission(task, userEmail),
    }));

    return (
        <div className="w-full overflow-x-auto rounded-md border dark:border-white shadow bg-white dark:bg-[#2a2e33]">
            <div className="min-w-[900px]">
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
                        rowExpandable: (record) =>
                            record.description && record.description.length > 0,
                    }}
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
        </div>
    );
};

export default TaskTable;
