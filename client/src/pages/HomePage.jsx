/**
 * Homepage component fetches tasks from an API and displays them using the TaskList component.
 *
 * @component
 * @example
 * return (
 *   <Homepage />
 * )
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @description
 * This component uses the `useEffect` hook to fetch tasks from the API endpoint
 * "http://localhost:8000/api/tasks" when the component mounts. The fetched tasks
 * are stored in the `tasks` state using the `useState` hook. The tasks are then
 * passed as a prop to the `TaskList` component for rendering.
 */
import { useEffect, useState } from "react";
import axios from "axios";
import TaskList from '../components/TaskList'

function Homepage() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        async function fetchTasks() {
            const res = await axios.get("http://localhost:8000/api/tasks");
            setTasks(res.data);
        }
        fetchTasks();
    }, []);

    return (
        <>
            <h1 className="text-3xl font-bold">Home page</h1>
            <TaskList tasks={tasks} />
        </>
    );
}

export default Homepage