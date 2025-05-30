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
    Tooltip,
    Empty,
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
    CloseCircleFilled,
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

    // Función auxiliar para obtener id o _id de proyecto
    const getProjectId = (project) => project?._id || project?.id;

    // Cargar proyectos y tareas al montar el componente
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // fetchProjects() y fetchTasks() retornan array directamente
                const projectsData = await fetchProjects();
                const tasksData = await fetchTasks();

                setProjects(Array.isArray(projectsData) ? projectsData : []);
                setTasks(Array.isArray(tasksData) ? tasksData : []);
            } catch (error) {
                // En caso de error, limpiar estados para evitar fallos visuales
                setProjects([]);
                setTasks([]);
            }
        };

        loadDashboardData();
    }, []);

    // Obtener tareas para una fecha específica (fecha inicio o fecha límite)
    const getTasksForDate = (date) => {
        const currentTasks = Array.isArray(tasks) ? tasks : [];
        return currentTasks.filter((task) => {
            const startMatch =
                task.startDate && dayjs(task.startDate).isSame(date, "day");
            const deadlineMatch =
                task.deadline && dayjs(task.deadline).isSame(date, "day");
            return startMatch || deadlineMatch;
        });
    };

    // Memo para optimizar renderizado de tareas para la fecha seleccionada
    const selectedDayTasks = useMemo(() => getTasksForDate(selectedDate), [
        tasks,
        selectedDate,
    ]);

    // Preparar datos para la tabla de proyectos
    const dataSource = (Array.isArray(projects) ? projects : []).map((p, index) => ({
        key: getProjectId(p) || index,
        _id: getProjectId(p),
        name: p.name,
        description: p.description || "No hay descripción.",
        collaborators: p.collaborators || [],
    }));

    // Columnas para la tabla de proyectos
    const columns = [
        {
            title: (
                <span>
                    <FolderOutlined className="mr-1" /> Nombre Proyecto
                </span>
            ),
            dataIndex: "name",
            key: "name",
        },
        {
            title: (
                <span>
                    <FileTextOutlined className="mr-1" /> Descripción
                </span>
            ),
            dataIndex: "description",
            key: "description",
        },
        {
            title: (
                <span>
                    <UserOutlined className="mr-1" /> Colaboradores
                </span>
            ),
            dataIndex: "collaborators",
            key: "collaborators",
            render: (collaborators) =>
                collaborators.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {collaborators.map((col, idx) => (
                            <li key={col.email || idx}>
                                <Tooltip title={`Permiso: ${col.permission || "desconocido"}`}>
                                    {col.email}
                                </Tooltip>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="text-neutral-500 dark:text-neutral-400 italic">
                        Sin colaboradores
                    </span>
                ),
        },
        {
            title: "",
            key: "ver",
            render: (_, record) => (
                <Button
                    size="small"
                    icon={<FolderOpenOutlined />}
                    onClick={() =>
                        navigate(`/proyectos?projectId=${getProjectId(record)}`)
                    }
                    style={{
                        background: "#FFFFFF",
                        borderColor: "#FED36A",
                        color: "#1A1A1A",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "6px",
                    }}
                >
                    Ver Proyecto
                </Button>
            ),
        },
    ];

    // Botón para ir al día de hoy en el calendario
    const handleToday = () => setSelectedDate(dayjs());

    return (
        <div className="w-full bg-gray-100 dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4 overflow-x-auto overflow-y-visible min-h-[400px]">
            <Title level={3} className="dark:text-white">
                MIS PROYECTOS
            </Title>
            <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mb-4">
                RESUMEN - PROYECTOS
            </p>

            {/* Tabla para pantallas grandes */}
            <div className="hidden sm:block">
                <div className="rounded-md border dark:border-white overflow-hidden shadow dark:bg-[#2a2e33]">
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        pagination={false}
                        bordered
                        locale={{
                            emptyText: (
                                <Empty description="Todo listo, pero aún no has creado ningún proyecto." />
                            ),
                        }}
                    />
                </div>
            </div>

            {/* Lista para pantallas pequeñas */}
            <div className="block sm:hidden mt-4">
                <ul className="flex flex-col gap-4">
                    {(Array.isArray(projects) ? projects : []).map((project) => (
                        <li
                            key={getProjectId(project)}
                            className="border dark:border-white bg-white dark:bg-[#2a2e33] text-black dark:text-white p-4 rounded-md shadow"
                        >
                            <p className="text-lg font-semibold">{project.name}</p>

                            <Collapse ghost className="mt-2">
                                <Panel
                                    header={
                                        <span className="text-sm font-medium dark:text-white">
                                            📄 Haz clic para ver la descripción
                                        </span>
                                    }
                                    key="desc"
                                >
                                    <p className="text-sm text-neutral-700 dark:text-white whitespace-pre-wrap break-words">
                                        {project.description || "No hay descripción."}
                                    </p>
                                </Panel>
                            </Collapse>

                            <div className="mt-4 flex justify-start">
                                <Button
                                    size="small"
                                    icon={<FolderOpenOutlined />}
                                    onClick={() =>
                                        navigate(`/proyectos?projectId=${getProjectId(project)}`)
                                    }
                                    style={{
                                        background: "#FFFFFF",
                                        borderColor: "#FED36A",
                                        color: "#1A1A1A",
                                        fontWeight: "bold",
                                        display: "flex",
                                        alignItems: "center",
                                        borderRadius: "6px",
                                    }}
                                >
                                    Ver Proyecto
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Divider className="my-8" />

            {/* Sección Calendario */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 ">
                <div className="flex flex-col">
                    <Title level={3} className="m-0 dark:text-white">
                        CALENDARIO
                    </Title>
                    <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">
                        RESUMEN - CALENDARIO{" "}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        size="middle"
                        icon={<FieldTimeOutlined />}
                        onClick={handleToday}
                        style={{
                            background: "#FFFFFF",
                            borderColor: "#3B82F6",
                            color: "#3B82F6",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "6px",
                        }}
                    >
                        Hoy
                    </Button>
                    <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => navigate("/calendario")}
                        style={{
                            background: "#FFFFFF",
                            borderColor: "#FED36A",
                            color: "#1A1A1A",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "6px",
                        }}
                    >
                        Ver Calendario
                    </Button>
                </div>
            </div>

            <ConfigProvider locale={esES}>
                <Calendar
                    className="w-full bg-white dark:bg-[#2a2e33] border dark:border-[#FFFFFF] text-black dark:text-white rounded-md shadow-sm"
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    cellRender={(date) => {
                        const deadlineTasks = (Array.isArray(tasks) ? tasks : []).filter(
                            (task) =>
                                task.deadline && dayjs(task.deadline).isSame(date, "day")
                        );
                        const startTasks = (Array.isArray(tasks) ? tasks : []).filter(
                            (task) => task.startDate && dayjs(task.startDate).isSame(date, "day")
                        );

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
                    <CheckCircleFilled style={{ color: "#1890ff" }} />
                    <span>
                        <strong>Fecha Inicio:</strong>&nbsp;Los números marcados en círculos azules.
                    </span>
                </span>
                <span className="flex items-center gap-2 mt-1 sm:mt-0">
                    <CloseCircleFilled style={{ color: "#ff4d4f" }} />
                    <span>
                        <strong>Fecha Límite:</strong>&nbsp;Los números marcados en círculos rojos.
                    </span>
                </span>
            </div>

            <br />
            <div className="w-full mb-4">
                <Title level={4} className="text-black dark:text-white">
                    LISTA DE TAREAS DEL DÍA: {selectedDate.format("DD/MM/YYYY")}
                    <p className="text-sm text-neutral-600 dark:text-[#FED36A] font-medium mt-1">
                        RESUMEN - REGISTRO DE TAREAS
                    </p>
                </Title>
                {selectedDayTasks.length > 0 ? (
                    <ul className="space-y-4 mt-4">
                        {selectedDayTasks.map((task) => (
                            <li
                                key={task._id}
                                className="border dark:border-white bg-white dark:bg-[#1f1f1f] dark:text-white text-black p-4 rounded-md shadow"
                            >
                                <p className="text-lg font-semibold">{task.title}</p>

                                <Collapse ghost className="mt-2">
                                    <Panel
                                        header={
                                            <span className="text-sm font-medium dark:text-white">
                                                📄 Haz clic para ver la descripción
                                            </span>
                                        }
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
                                            const dateToUse = task.deadline || task.startDate;
                                            if (dateToUse) {
                                                const formattedDate = dayjs(dateToUse).format(
                                                    "YYYY-MM-DD"
                                                );
                                                navigate(`/calendario?date=${formattedDate}`);
                                            } else {
                                                navigate("/calendario");
                                            }
                                        }}
                                        style={{
                                            background: "#FFFFFF",
                                            borderColor: "#FED36A",
                                            color: "#1A1A1A",
                                            fontWeight: "bold",
                                            display: "flex",
                                            alignItems: "center",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        Ver + detalles en Calendario
                                    </Button>
                                    <Button
                                        size="small"
                                        type="default"
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
                                            background: "#FFFFFF",
                                            borderColor: "#FED36A",
                                            color: "#1A1A1A",
                                            fontWeight: "bold",
                                            display: "flex",
                                            alignItems: "center",
                                            borderRadius: "6px",
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
