import { useEffect, useState } from 'react';
import {
    Calendar,
    Typography,
    Empty,
    ConfigProvider,
    Button,
    Collapse,
    Badge
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

    useEffect(() => {
        fetchTasks()
            .then((res) => setTasks(res.data))
            .catch((err) => console.error('Error al cargar tareas:', err));
    }, []);

    const getTasksForDate = (date) => {
        return tasks.filter(task =>
            task.deadline && dayjs(task.deadline).isSame(date, 'day')
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
        const dayTasks = getTasksForDate(date);
        return dayTasks.length > 0 ? (
            <div className="flex justify-center items-center">
                <Badge count={dayTasks.length} style={{ backgroundColor: '#FED36A', color: '#1A1A1A', fontWeight: 'bold' }} />
            </div>
        ) : null;
    };

    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <ConfigProvider locale={esES}>
            <div className="p-4 sm:p-6 bg-white text-black rounded-lg shadow-md max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Title level={3} className="text-black m-0">Calendario de Tareas</Title>
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
                    className="w-full bg-white rounded-md border shadow-sm"
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={handleSelect}
                    onPanelChange={handlePanelChange}
                    CellRender={dateCellRender}
                />

                {/* Leyenda */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    <span> 📅<strong> Nota:</strong> Los números corresponden a tareas por fecha límite.</span>
                </div>

                {/* Lista de tareas */}
                <div className="w-full mt-8">
                    <Title level={4} className="text-black">
                        Tareas para el {selectedDate.format('DD/MM/YYYY')}
                    </Title>

                    {selectedDayTasks.length > 0 ? (
                        <ul className="space-y-4 mt-4">
                            {selectedDayTasks.map((task) => (
                                <li
                                    key={task._id}
                                    className="border border-[#FED36A] bg-white text-black p-4 rounded-md shadow-sm"
                                >
                                    <p className="text-lg font-bold break-words whitespace-normal">{task.title}</p>

                                    <div className="text-sm mt-2 space-y-1">
                                        <Collapse ghost>
                                            <Panel header="Descripción" key="1" className="font-semibold text-sm">
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-700"
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
                                            className="font-bold bg-[#FED36A] hover:bg-[#fcd670] text-black border-none rounded-md"
                                        >
                                            Ver tarea
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty description="No hay tareas para este día" className="mt-4" />
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}

export default Calendario;
