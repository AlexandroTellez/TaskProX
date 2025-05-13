import { Input, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const TaskFilters = ({ filters, onChange, onReset }) => {
    return (
        <div className="flex flex-wrap gap-4">
            <Input
                placeholder="Buscar por título"
                value={filters.title}
                onChange={(e) => onChange('title', e.target.value)}
                className="w-full sm:w-52"
            />
            <Input
                placeholder="Buscar por creador"
                value={filters.creator}
                onChange={(e) => onChange('creator', e.target.value)}
                className="w-full sm:w-52"
            />
            <Select
                placeholder="Filtrar por estado"
                value={filters.status || undefined}
                onChange={(value) => onChange('status', value)}
                allowClear
                className="w-full sm:w-40"
            >
                <Option value="Pendiente">Pendiente</Option>
                <Option value="En proceso">En proceso</Option>
                <Option value="Completado">Completado</Option>
                <Option value="En espera">En espera</Option>
                <Option value="Cancelado">Cancelado</Option>
            </Select>
            <DatePicker
                placeholder="Fecha de inicio"
                value={filters.startDate}
                onChange={(date) => onChange('startDate', date ? dayjs(date) : null)}
                className="w-full sm:w-auto"
            />
            <DatePicker
                placeholder="Fecha límite"
                value={filters.deadline}
                onChange={(date) => onChange('deadline', date ? dayjs(date) : null)}
                className="w-full sm:w-auto"
            />
            <Button
                onClick={onReset}
                className="bg-neutral-200 hover:bg-neutral-300 font-semibold"
            >
                Limpiar filtros
            </Button>
        </div>
    );
};

export default TaskFilters;
