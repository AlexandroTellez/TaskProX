import { useEffect, useState } from 'react';
import { Calendar, Badge, Typography, Empty } from 'antd';
import dayjs from 'dayjs';
import { fetchTasks } from '../../api/tasks';

const { Title } = Typography;

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
            dayjs(task.deadline).isSame(date, 'day')
        );
    };

    const dateCellRender = (date) => {
        const dayTasks = getTasksForDate(date);
        return (
            <ul className="events">
                {dayTasks.map((item) => (
                    <li key={item._id}>
                        <Badge status="processing" text={item.title} />
                    </li>
                ))}
            </ul>
        );
    };

    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <div className="p-6 bg-white text-black rounded-lg shadow-md">
            <Title level={3} className="!mb-6">Calendario de Tareas</Title>

            <Calendar
                value={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                dateCellRender={dateCellRender}
            />

            <div className="mt-8">
                <Title level={4}>Tareas para el {selectedDate.format('DD/MM/YYYY')}</Title>
                {selectedDayTasks.length > 0 ? (
                    <ul className="space-y-2 mt-4">
                        {selectedDayTasks.map((task) => (
                            <li
                                key={task._id}
                                className="border border-neutral-200 p-4 rounded-md shadow-sm"
                            >
                                <p className="text-lg">{task.title}</p>
                                <p className="text-sm text-gray-500">Proyecto: {task.project?.name || 'Sin proyecto'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Empty description="No hay tareas para este día" className="mt-4" />
                )}
            </div>
        </div>
    );
}

export default Calendario;
