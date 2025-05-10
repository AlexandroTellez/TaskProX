import { useEffect, useState } from "react";
import { fetchTasks } from "../../api/tasks";
import TaskList from "../../components/task/TaskList";

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
        <>
            <h1 className="text-2xl font-bold mb-6">Tus Tareas</h1>
            <TaskList tasks={tasks} />
        </>
    );
}

export default Dashboard;
