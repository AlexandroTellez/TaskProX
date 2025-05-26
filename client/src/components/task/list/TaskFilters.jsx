import { Input, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const TaskFilters = ({ filters, onChange, onReset }) => {
    return (
        <div className="flex flex-wrap gap-x-6 gap-y-4 sm:items-end bg-white dark:bg-[#2a2e33]">
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Título</label>
                <Input
                    placeholder="Buscar por título"
                    value={filters.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    className="w-full sm:w-[180px]"
                />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Creador</label>
                <Input
                    placeholder="Buscar por creador"
                    value={filters.creator}
                    onChange={(e) => onChange('creator', e.target.value)}
                    className="w-full sm:w-[180px]"
                />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Colaborador</label>
                <Input
                    placeholder="Buscar por colaborador"
                    value={filters.collaborator}
                    onChange={(e) => onChange('collaborator', e.target.value)}
                    className="w-full sm:w-[180px]"
                />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Estado</label>
                <Select
                    placeholder="Estado"
                    value={filters.status || undefined}
                    onChange={(value) => onChange('status', value)}
                    allowClear
                    className="w-full sm:w-[140px]"
                >
                    <Option value="Pendiente">Pendiente</Option>
                    <Option value="En proceso">En proceso</Option>
                    <Option value="Completado">Completado</Option>
                    <Option value="En espera">En espera</Option>
                    <Option value="Cancelado">Cancelado</Option>
                </Select>
            </div>

            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Fecha de inicio</label>
                <DatePicker
                    placeholder="Inicio"
                    value={filters.startDate}
                    onChange={(date) => onChange('startDate', date ? dayjs(date) : null)}
                    className="w-full sm:w-[140px]"
                />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Fecha límite</label>
                <DatePicker
                    placeholder="Límite"
                    value={filters.deadline}
                    onChange={(date) => onChange('deadline', date ? dayjs(date) : null)}
                    className="w-full sm:w-[140px]"
                />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
                <Button
                    onClick={onReset}
                    className="bg-neutral-200 hover:bg-neutral-300 font-semibold w-full sm:w-auto"
                >
                    Limpiar filtros
                </Button>
            </div>
        </div>
    );
};

export default TaskFilters;
