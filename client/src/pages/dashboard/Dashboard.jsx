import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjects } from "../../api/projects";
import { fetchTasks } from "../../api/tasks";
import {
    Typography,
    Table,
    Button,
    Calendar,
    ConfigProvider,
    Divider,
    Collapse
} from "antd";
import {
    FolderOpenOutlined,
    FileTextOutlined,
    FolderOutlined,
    CalendarOutlined,
    ArrowRightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import esES from "antd/es/locale/es_ES";
import { FieldTimeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Panel } = Collapse;

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects()
            .then((res) => setProjects(res.data))
            .catch((err) => console.error("Error al obtener proyectos:", err));

        fetchTasks()
            .then((res) => setTasks(res.data))
            .catch((err) => console.error("Error al obtener tareas:", err));
    }, []);

    const dataSource = projects.map((p, index) => ({
        key: p._id || index,
        id: p._id || p.id,
        name: p.name,
        description: p.description || 'No hay descripción disponible',
    }));

    const columns = [
        {
            title: (
                <span>
                    <FolderOutlined className="mr-1" /> Nombre Proyecto
                </span>
            ),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: (
                <span>
                    <FileTextOutlined className="mr-1" /> Descripción
                </span>
            ),
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '',
            key: 'ver',
            render: (_, record) => (
                <Button
                    size="small"
                    icon={<FolderOpenOutlined />}
                    onClick={() => navigate(`/proyectos?projectId=${record.id}`)}
                    style={{
                        backgroundColor: '#FED36A',
                        borderColor: '#FED36A',
                        color: '#1A1A1A',
                        fontWeight: 'bold',
                    }}
                >
                    Ver Proyecto
                </Button>
            ),
        },
    ];

    const getTasksForDate = (date) => {
        return tasks.filter(task =>
            task.deadline && dayjs(task.deadline).isSame(date, 'day')
        );
    };

    const selectedDayTasks = getTasksForDate(selectedDate);

    const handleToday = () => {
        setSelectedDate(dayjs());
    };

    return (
        <div className="p-6 bg-white text-black rounded-lg shadow-md">
            <Title level={3}>Mis Proyectos</Title>
            <p className="text-sm text-neutral-600 mb-4">Resumen - Proyectos</p>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
            />

            <Divider className="my-8" />

            <div className="flex justify-between items-center mb-4">
                <Title level={3} className="m-0">Calendario</Title>
                <div className="flex gap-2">
                    <Button
                        size="middle"
                        icon={<FieldTimeOutlined />}
                        onClick={handleToday}
                        style={{
                            backgroundColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '6px',
                        }}
                    >
                        Hoy
                    </Button>
                    <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => navigate('/calendario')}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#FED36A',
                            color: '#1A1A1A',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                        }}
                    >
                        Ver Calendario
                    </Button>
                </div>
            </div>


            <p className="text-sm text-neutral-600 mb-4">Resumen - Calendario de tareas</p>

            <ConfigProvider locale={esES}>
                <Calendar
                    fullscreen={false}
                    className="bg-white rounded-md border shadow mb-6"
                    value={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                />
            </ConfigProvider>

            <div className="w-full mb-4">
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

                                <Collapse ghost className="mt-2">
                                    <Panel
                                        header={<span className="text-sm font-medium">📄 Haz clic para ver la descripción</span>}
                                        key="1"
                                    >
                                        <div
                                            className="text-gray-700 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: task.description }}
                                        />
                                    </Panel>
                                </Collapse>

                                <div className="flex gap-2 mt-4 flex-wrap">
                                    <Button
                                        size="small"
                                        type="default"
                                        icon={<CalendarOutlined />}
                                        onClick={() => navigate('/calendario')}
                                        style={{
                                            backgroundColor: '#FED36A',
                                            color: '#1A1A1A',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            borderRadius: '6px',
                                        }}
                                    >
                                        Ver en Calendario
                                    </Button>
                                    <Button
                                        size="small"
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
                                            backgroundColor: '#FED36A',
                                            color: '#1A1A1A',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            borderRadius: '6px',
                                        }}
                                    >
                                        Ver en Proyecto
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-neutral-500">No hay tareas para este día.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
