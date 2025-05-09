import { useEffect, useState } from "react";
import { fetchTasks } from "../../api/tasks";
import TaskList from "../../components/task/TaskList";
import DashboardLayout from "../../layout/DashboardLayout";

function Dashboard() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks()
            .then((res) => {
                setTasks(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-6">Tus Tareas</h1>
            <TaskList tasks={tasks} />
        </DashboardLayout>
    );
}

export default Dashboard;
