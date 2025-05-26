import { useEffect, useState } from 'react';
import {
    Calendar,
    Typography,
    Empty,
    ConfigProvider,
    Button,
    Collapse,
    Badge,
} from 'antd';
import { ArrowRightOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from '../../utils/dayjsConfig';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import esES from 'antd/es/locale/es_ES';
import { fetchTasks } from '../../api/tasks';
import { useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { Panel } = Collapse;

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

function Calendario() {
    const [tasks, setTasks] = useState([]);
    const [searchParams] = useSearchParams();
    const defaultDate = searchParams.get('date');
    const [selectedDate, setSelectedDate] = useState(defaultDate ? dayjs(defaultDate) : dayjs());
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        fetchTasks()
            .then((res) => setTasks(res.data))
            .catch((err) => console.error('Error al cargar tareas:', err));
    }, []);

    useEffect(() => {
        const matchDark = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(matchDark.matches);

        const listener = (e) => setIsDarkMode(e.matches);
        matchDark.addEventListener('change', listener);

        return () => matchDark.removeEventListener('change', listener);
    }, []);

    const getTasksForDate = (date) => {
        return tasks.filter(task =>
            task.deadline && dayjs(task.deadline).isSame(date, 'day')
        );
    };

    const getStartTasksForDate = (date) => {
        return tasks.filter(task =>
            task.startDate && dayjs(task.startDate).isSame(date, 'day')
        );
    };

    const handlePanelChange = (date) => {
        setSelectedDate(date.startOf('month'));
    };

    const handleSelect = (date) => {
        setSelectedDate(date);
    };

    const handleToday = () => {
        setSelectedDate(dayjs());
    };

    const dateCellRender = (date) => {
        const deadlineTasks = getTasksForDate(date);
        const startTasks = getStartTasksForDate(date);

        return (
            <div className="flex flex-col items-center justify-center gap-1">
                {/* Marcador de fecha de inicio */}
                {startTasks.length > 0 && (
                    <div className="rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold bg-black text-white dark:bg-white dark:text-black">
                        {startTasks.length}
                    </div>
                )}

                {/* Marcador de fecha límite */}
                {deadlineTasks.length > 0 && (
                    <Badge
                        count={deadlineTasks.length}
                        style={{
                            backgroundColor: '#B91C1C', // rojo suave
                            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
                            fontWeight: 'bold'
                        }}
                    />
                )}
            </div>
        );
    };


    const selectedDayTasks = tasks.filter(task => {
        const startMatch = task.startDate && dayjs(task.startDate).isSame(selectedDate, 'day');
        const deadlineMatch = task.deadline && dayjs(task.deadline).isSame(selectedDate, 'day');
        return startMatch || deadlineMatch;
    });

    return (
        <ConfigProvider locale={esES} >
            <div className="p-4 sm:p-6 bg-white text-black dark:bg-[#1A1A1A] dark:text-white rounded-lg shadow-md mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Title level={3} className="text-black dark:text-white m-0">CALENDARIO DE TAREAS
                        <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1"> RESUMEN CALENDARIO - FECHA DE INICIO Y FECHA LÍMITE</p>
                    </Title>

                    <Button
                        size="middle"
                        icon={<FieldTimeOutlined />}
                        onClick={handleToday}
                        className="font-bold border-none rounded-md bg-[#FED36A] hover:bg-[#fcd670] text-black"
                    >
                        Hoy
                    </Button>
                </div>

                {/* Calendario */}
                <Calendar
                    className="w-full bg-white dark:bg-[#2a2e33] border dark:border-[#FED36A] text-black dark:text-white rounded-md shadow-sm"
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={handleSelect}
                    onPanelChange={handlePanelChange}
                    cellRender={dateCellRender}
                />

                {/* Leyenda */}
                <div className="mt-4 flex flex-col sm:flex-row justify-center items-start sm:items-center sm:gap-x-6 text-sm text-gray-600 dark:text-white text-start">
                    <span className="flex items-start">
                        ⚪⚫ <span><strong>Fecha inicio:</strong>&nbsp;Los números marcados en circulos blancos o negros.</span>
                    </span>
                    <span className="flex items-start mt-1 sm:mt-0">
                        🔴 <span><strong>Fecha límite:</strong>&nbsp;Los números marcados en circulos rojos.</span>
                    </span>
                </div>

                {/* Lista de tareas */}
                <div className="w-full mt-8">
                    <Title level={4} className="text-black dark:text-white">
                        LISTA DE TAREAS: {selectedDate.format('DD/MM/YYYY')}
                        <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">RESUMEN DETALLADO - REGISTRO DE TAREAS</p>
                    </Title>

                    {selectedDayTasks.length > 0 ? (
                        <ul className="space-y-4 mt-4">
                            {selectedDayTasks.map((task) => (
                                <li
                                    key={task._id}
                                    className="border dark:border-[#FED36A] bg-white dark:bg-[#2a2e33] text-black dark:text-white p-4 rounded-md shadow-sm"
                                >
                                    <p className="text-lg font-bold break-words whitespace-normal">{task.title}</p>

                                    <div className="text-sm mt-2 space-y-1">
                                        <Collapse ghost className="mt-2">
                                            <Panel
                                                header={<span className="text-sm font-medium dark:text-white">📄 Haz clic para ver la descripción</span>}
                                                key="1"
                                            >
                                                <div
                                                    className="text-gray-700 dark:text-white prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: task.description }}
                                                />
                                            </Panel>
                                        </Collapse>

                                        <p><strong>Creador:</strong> {task.creator || 'No especificado'}</p>
                                        <p><strong>Fecha Inicio:</strong> {task.startDate ? dayjs(task.startDate).format('DD/MM/YYYY') : '—'}</p>
                                        <p><strong>Fecha Límite:</strong> {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Sin fecha'}</p>
                                        <p><strong>Estado:</strong> {task.status}</p>
                                    </div>

                                    <div className="mt-4 flex justify-start">
                                        <Button
                                            icon={<ArrowRightOutlined />}
                                            onClick={() => {
                                                const url = task.projectId
                                                    ? `/proyectos?projectId=${task.projectId}`
                                                    : '/proyectos';
                                                window.open(url, '_blank');
                                            }}
                                            className="font-bold bg-[#FED36A] hover:bg-[#fcd670] text-black  border-none rounded-md"
                                        >
                                            Ver tarea
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty
                            description={
                                <span className="text-neutral-700 dark:text-white">
                                    No hay tareas para este día
                                </span>
                            }
                        />
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}

export default Calendario;
