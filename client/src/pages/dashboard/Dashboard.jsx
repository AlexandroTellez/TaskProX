import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjects } from "../../api/projects";
import { Typography, Table, Progress, Tag, Button } from "antd";
import { FolderOpenOutlined } from "@ant-design/icons";

const { Title } = Typography;

const getStatusTag = (status) => {
    let color;
    switch (status) {
        case 'Completado': color = 'green'; break;
        case 'En proceso': color = 'gold'; break;
        case 'Pendiente':
        case 'En peligro': color = 'red'; break;
        default: color = 'gray';
    }
    return <Tag color={color}>{status || 'Sin estado'}</Tag>;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
};

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects()
            .then((res) => setProjects(res.data))
            .catch((err) => console.log(err));
    }, []);

    const dataSource = projects.map((p, index) => ({
        key: p._id || index,
        id: p._id || p.id,
        name: p.name,
        creator: p.creator || 'Desconocido',
        deadline: formatDate(p.deadline),
        status: p.status || 'Pendiente',
        progress: p.progress ?? 0,
    }));

    const columns = [
        { title: 'Nombre Proyecto', dataIndex: 'name', key: 'name' },
        { title: 'Creador', dataIndex: 'creator', key: 'creator' },
        { title: 'Fecha límite', dataIndex: 'deadline', key: 'deadline' },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Progreso',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress) => (
                <Progress percent={progress} size="small" strokeColor="#FED36A" />
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
                        fontWeight: 'normal',
                    }}
                >
                    Ver Proyecto
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white text-black rounded-lg shadow-md">
            <Title level={3}>Mis Proyectos</Title>
            <p className="text-sm text-neutral-600 mb-4">Resumen -  Proyectos </p>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
            />
        </div>
    );
}

export default Dashboard;
