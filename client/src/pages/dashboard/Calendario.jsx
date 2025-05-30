import { useEffect, useState } from 'react';
import {
    Calendar,
    Typography,
    Empty,
    ConfigProvider,
    Button,
    Collapse,
    message,
} from 'antd';
import {
    ArrowRightOutlined,
    FieldTimeOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    DownloadOutlined,
} from '@ant-design/icons';
import dayjs from '../../utils/dayjsConfig';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import esES from 'antd/es/locale/es_ES';
import { fetchTasks } from '../../api/tasks';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getStatusTag } from '../../components/task/list/utils';

const { Title } = Typography;
const { Panel } = Collapse;

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

// ===================== Función para descargar archivos base64 =====================
function descargarArchivo(file) {
    try {
        if (!file || !file.data || typeof file.data !== "string") {
            console.error("Archivo inválido o sin contenido base64:", file);
            return;
        }

        let base64Data = file.data;
        const base64Match = file.data.match(/^data:(.*);base64,(.*)$/);
        if (base64Match) base64Data = base64Match[2];

        const byteCharacters = atob(base64Data.trim());
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

        let safeFileName = file.name || 'archivo';
        if (safeFileName.startsWith('.')) {
            safeFileName = `descarga_${safeFileName.replace(/^\.+/, '')}`;
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success(`Descarga completada: ${safeFileName}`);
    } catch (error) {
        console.error('Error al intentar descargar el archivo:', error);
        message.error('Error al descargar el archivo');
    }
}

function Calendario() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [searchParams] = useSearchParams();
    const defaultDate = searchParams.get('date');
    const [selectedDate, setSelectedDate] = useState(defaultDate ? dayjs(defaultDate) : dayjs());

    useEffect(() => {
        fetchTasks()
            .then(res => setTasks(Array.isArray(res) ? res : []))
            .catch(() => setTasks([]));
    }, []);

    // Filtrar tareas por fecha límite
    const getTasksForDate = (date) => {
        if (!Array.isArray(tasks)) return [];
        return tasks.filter(task =>
            task.deadline && dayjs(task.deadline).isSame(dayjs(date), 'day')
        );
    };

    // Filtrar tareas por fecha inicio
    const getStartTasksForDate = (date) => {
        if (!Array.isArray(tasks)) return [];
        return tasks.filter(task =>
            task.startDate && dayjs(task.startDate).isSame(dayjs(date), 'day')
        );
    };

    const handlePanelChange = (date) => {
        setSelectedDate(dayjs(date).startOf('month'));
    };

    const handleSelect = (date) => {
        setSelectedDate(dayjs(date));
    };

    const handleToday = () => {
        setSelectedDate(dayjs());
    };

    // Renderizar indicadores en cada celda del calendario
    const dateCellRender = (date) => {
        const deadlineTasks = getTasksForDate(date);
        const startTasks = getStartTasksForDate(date);

        return (
            <div className="flex flex-row items-center justify-center gap-1 overflow-hidden max-w-full">
                {startTasks.length > 0 && (
                    <div className="rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-blue-500">
                        {startTasks.length}
                    </div>
                )}
                {deadlineTasks.length > 0 && (
                    <div className="rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500">
                        {deadlineTasks.length}
                    </div>
                )}
            </div>
        );
    };

    const startTasksToday = getStartTasksForDate(selectedDate);
    const deadlineTasksToday = getTasksForDate(selectedDate);
    const noTasksToday = startTasksToday.length === 0 && deadlineTasksToday.length === 0;

    return (
        <ConfigProvider locale={esES}>
            <div className="w-full bg-gray-100 dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4 overflow-x-auto overflow-y-visible min-h-[400px]">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Title level={3} className="text-black dark:text-white m-0">
                        CALENDARIO DE TAREAS
                        <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">
                            RESUMEN CALENDARIO - FECHA DE INICIO Y FECHA LÍMITE
                        </p>
                    </Title>
                    <Button
                        size="middle"
                        icon={<FieldTimeOutlined />}
                        onClick={handleToday}
                        style={{
                            background: '#FFFFFF',
                            borderColor: '#3B82F6',
                            color: '#3B82F6',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '6px',
                        }}
                        aria-label="Ir al día de hoy"
                    >
                        Hoy
                    </Button>
                </div>

                {/* Calendario */}
                <Calendar
                    className="w-full bg-white dark:bg-[#1f1f1f] border dark:border-[#FFFFFF] text-black dark:text-white rounded-md shadow-sm"
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={handleSelect}
                    onPanelChange={handlePanelChange}
                    cellRender={dateCellRender}
                />

                {/* Leyenda */}
                <div className="mt-4 flex flex-col sm:flex-row justify-center items-start sm:items-center sm:gap-x-6 text-sm text-gray-600 dark:text-white text-start">
                    <span className="flex items-center gap-2">
                        <CheckCircleFilled style={{ color: '#1890ff' }} />
                        <span><strong>Fecha Inicio:</strong>&nbsp;Los números marcados en círculos azules.</span>
                    </span>
                    <span className="flex items-center gap-2 mt-1 sm:mt-0">
                        <CloseCircleFilled style={{ color: '#ff4d4f' }} />
                        <span><strong>Fecha Límite:</strong>&nbsp;Los números marcados en círculos rojos.</span>
                    </span>
                </div>

                {/* Lista de tareas del día */}
                <div className="w-full mt-8">
                    <Title level={4} className="text-black dark:text-white">
                        TAREAS DEL DÍA: {dayjs(selectedDate).format('DD/MM/YYYY')}
                        <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">
                            RESUMEN DETALLADO – TABLERO KANBAN
                        </p>
                    </Title>

                    {noTasksToday ? (
                        <Empty description={<span className="text-neutral-700 dark:text-white">¡Todo despejado por hoy! Sin tareas pendientes.</span>} />
                    ) : (
                        <div className="flex flex-col sm:flex-row sm:gap-8 mt-6">
                            {/* Tareas con fecha de inicio */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-4 text-blue-500 flex items-center gap-2">
                                    <CheckCircleFilled /> FECHA INICIO
                                </h3>
                                <div className="border-t dark:border-white border-black my-4 opacity-20" />
                                <ul className="space-y-4">
                                    {startTasksToday.map((task) => (
                                        <li key={task._id} className="border dark:border-[#FFFFFF] bg-white dark:bg-[#1f1f1f] text-black dark:text-white p-4 rounded-md shadow-sm">
                                            <p className="text-lg font-bold break-words whitespace-normal">{task.title}</p>
                                            <div className="text-sm mt-2 space-y-1">
                                                
                                                <p><strong>Creador:</strong> {task.creator_name || task.creator || 'No especificado'}</p>
                                                <p><strong>Colaboradores:</strong> {task.collaborators?.length > 0 ? task.collaborators.map(col => col.name || col.email).join(', ') : 'Ninguno'}</p>
                                                <p><strong>Fecha Inicio:</strong> {dayjs(task.startDate).format('DD/MM/YYYY')}</p>
                                                <p><strong>Fecha Límite:</strong> {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Sin fecha'}</p>
                                                <p><strong>Estado:</strong> {getStatusTag(task.status)}</p>
                                                <Collapse ghost className="mt-2">
                                                    {task.recurso && task.recurso.length > 0 && (
                                                        <div className="text-sm mt-2">
                                                            <strong className="text-black dark:text-white">Archivos adjuntos:</strong>
                                                            <ul className="list-disc list-inside mt-1 space-y-1 text-black dark:text-white">

                                                                {task.recurso.map((file, index) => (
                                                                    <li key={index}>
                                                                        <Button
                                                                            type="link"
                                                                            icon={<DownloadOutlined />}
                                                                            onClick={() => descargarArchivo(file)}
                                                                            className="px-0 text-blue-500 dark:text-blue-300 !whitespace-normal !break-words !text-left !p-0 max-w-full"
                                                                            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                                                                        >
                                                                            {file.name}
                                                                        </Button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <Panel header={<span className="text-sm font-bold dark:text-white">📄 Haz clic para ver la descripción</span>} key="desc-start">
                                                        <div
                                                            className="text-gray-700 dark:text-white prose prose-sm dark:prose-invert max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: task.description }}
                                                        />
                                                    </Panel>
                                                </Collapse>
                                            </div>
                                            <div className="mt-4 flex justify-start">
                                                <Button
                                                    icon={<ArrowRightOutlined />}
                                                    onClick={() => {
                                                        const url = task.projectId
                                                            ? `/proyectos?projectId=${task.projectId}`
                                                            : "/proyectos";
                                                        navigate(url, {
                                                            state: { taskId: task._id },
                                                        });
                                                    }}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderColor: '#FED36A',
                                                        color: '#1A1A1A',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: '6px',
                                                    }}
                                                    aria-label={`Ver detalles de la tarea ${task.title}`}
                                                >
                                                    Ver tarea
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tareas con fecha límite */}
                            <div className="flex-1 mt-10 sm:mt-0">
                                <h3 className="text-lg font-bold mb-4 text-red-500 flex items-center gap-2">
                                    <CloseCircleFilled /> FECHA LÍMITE
                                </h3>
                                <div className="border-t dark:border-white border-black my-4 opacity-20" />
                                <ul className="space-y-4">
                                    {deadlineTasksToday.map((task) => (
                                        <li key={task._id} className="border dark:border-[#FFFFFF] bg-white dark:bg-[#1f1f1f] text-black dark:text-white p-4 rounded-md shadow-sm">
                                            <p className="text-lg font-bold break-words whitespace-normal">{task.title}</p>
                                            <div className="text-sm mt-2 space-y-1">
                                                <p><strong>Creador:</strong> {task.creator_name || task.creator || 'No especificado'}</p>
                                                <p><strong>Colaboradores:</strong> {task.collaborators?.length > 0 ? task.collaborators.map(col => col.name || col.email).join(', ') : 'Ninguno'}</p>
                                                <p><strong>Fecha Inicio:</strong> {task.startDate ? dayjs(task.startDate).format('DD/MM/YYYY') : '—'}</p>
                                                <p><strong>Fecha Límite:</strong> {dayjs(task.deadline).format('DD/MM/YYYY')}</p>
                                                <p><strong>Estado:</strong> {getStatusTag(task.status)}</p>
                                                <Collapse ghost className="mt-2">
                                                    {task.recurso && task.recurso.length > 0 && (
                                                        <div className="text-sm mt-2">
                                                            <strong className="text-black dark:text-white">Archivos adjuntos:</strong>
                                                            <ul className="list-disc list-inside mt-1 space-y-1 text-black dark:text-white">

                                                                {task.recurso.map((file, index) => (
                                                                    <li key={index}>
                                                                        <Button
                                                                            type="link"
                                                                            icon={<DownloadOutlined />}
                                                                            onClick={() => descargarArchivo(file)}
                                                                            className="px-0 text-blue-500 dark:text-blue-300 !whitespace-normal !break-words !text-left !p-0 max-w-full"
                                                                            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                                                                        >
                                                                            {file.name}
                                                                        </Button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <Panel header={<span className="text-sm font-bold dark:text-white">📄 Haz clic para ver la descripción</span>} key="desc-deadline">
                                                        <div
                                                            className="text-gray-700 dark:text-white prose prose-sm dark:prose-invert max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: task.description }}
                                                        />
                                                    </Panel>
                                                </Collapse>
                                            </div>
                                            <div className="mt-4 flex justify-start">
                                                <Button
                                                    icon={<ArrowRightOutlined />}
                                                    onClick={() => {
                                                        const url = task.projectId
                                                            ? `/proyectos?projectId=${task.projectId}`
                                                            : "/proyectos";
                                                        navigate(url, {
                                                            state: { taskId: task._id },
                                                        });
                                                    }}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderColor: '#FED36A',
                                                        color: '#1A1A1A',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: '6px',
                                                    }}
                                                    aria-label={`Ver detalles de la tarea ${task.title}`}
                                                >
                                                    Ver tarea
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}

export default Calendario;
