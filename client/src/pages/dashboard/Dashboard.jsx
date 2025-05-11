import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjects } from "../../api/projects";
import { Typography, Table, Button } from "antd";
import { FolderOpenOutlined, FileTextOutlined, FolderOutlined } from "@ant-design/icons";

const { Title } = Typography;

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects()
            .then((res) => setProjects(res.data))
            .catch((err) => console.error("Error al obtener proyectos:", err));
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
            <p className="text-sm text-neutral-600 mb-4">Resumen - Proyectos</p>

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
