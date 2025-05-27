import { useEffect, useState, useMemo } from "react";
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
    Collapse,
    Tooltip
} from "antd";
import {
    FolderOpenOutlined,
    FileTextOutlined,
    FolderOutlined,
    CalendarOutlined,
    ArrowRightOutlined,
    FieldTimeOutlined,
    UserOutlined,
    CheckCircleFilled,
    CloseCircleFilled
} from "@ant-design/icons";
import dayjs from "dayjs";
import esES from "antd/es/locale/es_ES";

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
        description: p.description || 'No hay descripción.',
        collaborators: p.collaborators || [],
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
            title: (
                <span>
                    <UserOutlined className="mr-1" /> Colaboradores
                </span>
            ),
            dataIndex: 'collaborators',
            key: 'collaborators',
            render: (collaborators) =>
                collaborators.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {collaborators.map((col, idx) => (
                            <li key={idx}>
                                <Tooltip title={`Permiso: ${col.permission}`}>
                                    {col.email}
                                </Tooltip>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="text-neutral-500 dark:text-neutral-400 italic">Sin colaboradores</span>
                ),
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
        return tasks.filter(task => {
            const startMatch = task.startDate && dayjs(task.startDate).isSame(date, 'day');
            const deadlineMatch = task.deadline && dayjs(task.deadline).isSame(date, 'day');
            return startMatch || deadlineMatch;
        });
    };

    const selectedDayTasks = useMemo(() => getTasksForDate(selectedDate), [tasks, selectedDate]);

    const handleToday = () => setSelectedDate(dayjs());

    return (
        <div className="w-full bg-white text-black dark:bg-[#1A1A1A] dark:text-white ">
            <Title level={3} className="dark:text-white">MIS PROYECTOS</Title>
            <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mb-4">RESUMEN - PROYECTOS</p>

            <div className="hidden sm:block">
                <div className="rounded-md border dark:border-[#FED36A] overflow-hidden shadow dark:bg-[#2a2e33]">
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        pagination={false}
                        bordered
                    />
                </div>
            </div>

            <div className="block sm:hidden mt-4">
                <ul className="flex flex-col gap-4">
                    {projects.map((project) => (
                        <li
                            key={project._id}
                            className="border dark:border-[#FED36A] bg-white dark:bg-[#2a2e33] text-black dark:text-white p-4 rounded-md shadow"
                        >
                            <p className="text-lg font-semibold">{project.name}</p>

                            <Collapse ghost className="mt-2">
                                <Panel
                                    header={<span className="text-sm font-medium dark:text-white">📄 Haz clic para ver la descripción</span>}
                                    key="desc"
                                >
                                    <p className="text-sm text-neutral-700 dark:text-white whitespace-pre-wrap break-words">
                                        {project.description || 'No hay descripción.'}
                                    </p>
                                </Panel>
                            </Collapse>

                            <div className="mt-4 flex justify-start">
                                <Button
                                    size="small"
                                    icon={<FolderOpenOutlined />}
                                    onClick={() => navigate(`/proyectos?projectId=${project._id}`)}
                                    className="font-bold bg-[#FED36A] hover:bg-[#fcd670] text-black border-none rounded-md"
                                >
                                    Ver Proyecto
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Divider className="my-8" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 ">
                <div className="flex flex-col">
                    <Title level={3} className="m-0 dark:text-white">CALENDARIO</Title>
                    <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">RESUMEN CALENDARIO - FECHA DE INICIO Y FECHA LÍMITE</p>
                </div>

                <div className="flex flex-wrap gap-2">
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

            <ConfigProvider locale={esES}>
                <Calendar
                    className="w-full bg-white dark:bg-[#2a2e33] border dark:border-[#FED36A] text-black dark:text-white rounded-md shadow-sm"
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    cellRender={(date) => {
                        const deadlineTasks = tasks.filter(task => task.deadline && dayjs(task.deadline).isSame(date, 'day'));
                        const startTasks = tasks.filter(task => task.startDate && dayjs(task.startDate).isSame(date, 'day'));

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
                    }}
                />
            </ConfigProvider>

            {/* Leyenda */}
            <div className="mt-4 flex flex-col sm:flex-row justify-center items-start sm:items-center sm:gap-x-6 text-sm text-gray-600 dark:text-white text-start">
                <span className="flex items-center gap-2">
                    <CheckCircleFilled style={{ color: '#1890ff' }} />
                    <span>
                        <strong>Fecha Inicio:</strong>&nbsp;Los números marcados en círculos azules.
                    </span>
                </span>
                <span className="flex items-center gap-2 mt-1 sm:mt-0">
                    <CloseCircleFilled style={{ color: '#ff4d4f' }} />
                    <span>
                        <strong>Fecha Límite:</strong>&nbsp;Los números marcados en círculos rojos.
                    </span>
                </span>
            </div>

            <br />
            <div className="w-full mb-4">
                <Title level={4} className="text-black dark:text-white">
                    LISTA DE TAREAS DEL DÍA: {selectedDate.format('DD/MM/YYYY')}
                    <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">RESUMEN - REGISTRO DE TAREAS</p>
                </Title>
                {selectedDayTasks.length > 0 ? (
                    <ul className="space-y-4 mt-4">
                        {selectedDayTasks.map((task) => (
                            <li
                                key={task._id}
                                className="border dark:border-[#FED36A] bg-white dark:bg-[#2a2e33] dark:text-white text-black p-4 rounded-md shadow"
                            >
                                <p className="text-lg font-semibold">{task.title}</p>

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

                                <div className="flex gap-2 mt-4 flex-wrap">
                                    <Button
                                        size="small"
                                        type="default"
                                        icon={<CalendarOutlined />}
                                        onClick={() => {
                                            // Usar fecha límite si está presente, o fecha de inicio si no hay límite
                                            const dateToUse = task.deadline || task.startDate;

                                            if (dateToUse) {
                                                const formattedDate = dayjs(dateToUse).format('YYYY-MM-DD');
                                                navigate(`/calendario?date=${formattedDate}`);
                                            } else {
                                                navigate('/calendario');
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
                                        Ver + detalles en Calendario
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
                                        Ver + detalles en Proyecto
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-neutral-500 dark:text-white">No hay tareas para este día.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
