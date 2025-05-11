import { useEffect, useState } from 'react';
import {
    Calendar,
    Typography,
    Empty,
    ConfigProvider,
    Button,
    Collapse
} from 'antd';
import { ArrowRightOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import esES from 'antd/es/locale/es_ES';
import { fetchTasks } from '../../api/tasks';

const { Title } = Typography;
const { Panel } = Collapse;

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.locale('es');
dayjs.updateLocale('es', { weekStart: 1 });

function Calendario() {
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());

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
        // Cambiar al primer día visible del mes seleccionado
        setSelectedDate(date.startOf('month'));
    };

    const handleSelect = (date) => {
        setSelectedDate(date);
    };

    const handleToday = () => {
        setSelectedDate(dayjs());
    };

    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <ConfigProvider locale={esES}>
            <div className="p-6 bg-white text-black rounded-lg shadow-md flex flex-col items-center max-w-5xl mx-auto">
                <div className="flex justify-between w-full items-center mb-6">
                    <Title level={3} className="text-black m-0">Calendario de Tareas</Title>
                    <Button
                        size="middle"
                        icon={<FieldTimeOutlined />}
                        onClick={handleToday}
                        style={{
                            backgroundColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '6px'
                        }}
                    >
                        Hoy
                    </Button>
                </div>

                <Calendar
                    className="w-full bg-white rounded-md shadow border"
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={handleSelect}
                    onPanelChange={handlePanelChange}
                />

                <div className="w-full mt-8">
                    <Title level={4} className="text-black">
                        Tareas para el {selectedDate.format('DD/MM/YYYY')}
                    </Title>
                    {selectedDayTasks.length > 0 ? (
                        <ul className="space-y-4 mt-4">
                            {selectedDayTasks.map((task) => (
                                <li
                                    key={task._id}
                                    className="border border-[#FED36A] bg-white text-black p-4 rounded-md shadow"
                                >
                                    <p className="text-lg font-semibold">{task.title}</p>

                                    <div className="text-sm mt-2 space-y-1">
                                        <Collapse ghost>
                                            <Panel header="Descripción" key="1" className="font-bold">
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

                                    <Button
                                        type="default"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => {
                                            if (task.projectId) {
                                                window.open(`/proyectos?projectId=${task.projectId}`, '_blank');
                                            } else {
                                                window.open('/proyectos', '_blank');
                                            }
                                        }}
                                        style={{
                                            marginTop: '12px',
                                            backgroundColor: '#FED36A',
                                            color: '#1A1A1A',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            borderRadius: '6px',
                                        }}
                                    >
                                        Ver tarea
                                    </Button>
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
