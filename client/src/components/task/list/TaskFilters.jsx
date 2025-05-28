import { Input, Select, DatePicker, Button } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getStatusTag } from './utils';

const { Option } = Select;

const predefinedStatuses = [
    "pendiente",
    "en espera",
    "lista para comenzar",
    "en progreso",
    "en revisión",
    "completado",
];

const TaskFilters = ({ filters, onChange, onReset }) => {
    const [isCustomStatus, setIsCustomStatus] = useState(false);
    const [customStatusValue, setCustomStatusValue] = useState("");

    useEffect(() => {
        if (
            filters.status &&
            !predefinedStatuses.includes(filters.status.toLowerCase())
        ) {
            setIsCustomStatus(true);
            setCustomStatusValue(filters.status);
        } else {
            setIsCustomStatus(false);
        }
    }, [filters.status]);

    const handleStatusChange = (value) => {
        if (value === "__custom__") {
            setIsCustomStatus(true);
            setCustomStatusValue("");
            onChange("status", "");
        } else {
            setIsCustomStatus(false);
            onChange("status", value);
        }
    };

    const handleCustomStatusInput = (e) => {
        const val = e.target.value;
        setCustomStatusValue(val);
        onChange("status", val);
    };

    return (
        <div className="flex flex-wrap gap-x-6 gap-y-4 sm:items-end bg-white dark:bg-[#2a2e33]">
            {/* Título */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Título</label>
                <Input
                    placeholder="Buscar por título"
                    value={filters.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    className="w-full sm:w-[180px]"
                />
            </div>

            {/* Creador */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Creador</label>
                <Input
                    placeholder="Buscar por creador"
                    value={filters.creator}
                    onChange={(e) => onChange('creator', e.target.value)}
                    className="w-full sm:w-[180px]"
                />
            </div>

            {/* Colaborador */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Colaborador</label>
                <Input
                    placeholder="Buscar por colaborador"
                    value={filters.collaborator}
                    onChange={(e) => onChange('collaborator', e.target.value)}
                    className="w-full sm:w-[180px]"
                />
            </div>

            {/* Fecha de inicio */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Fecha de inicio</label>
                <DatePicker
                    placeholder="Inicio"
                    value={filters.startDate}
                    onChange={(date) => onChange('startDate', date ? dayjs(date) : null)}
                    className="w-full sm:w-[140px]"
                />
            </div>

            {/* Fecha límite */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Fecha límite</label>
                <DatePicker
                    placeholder="Límite"
                    value={filters.deadline}
                    onChange={(date) => onChange('deadline', date ? dayjs(date) : null)}
                    className="w-full sm:w-[140px]"
                />
            </div>

            {/* Estado con colores */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Estado</label>
                <Select
                    placeholder="Estado"
                    value={isCustomStatus ? "__custom__" : filters.status || undefined}
                    onChange={handleStatusChange}
                    allowClear
                    className="w-full sm:w-[180px]"
                >
                    {predefinedStatuses.map((status) => (
                        <Option key={status} value={capitalize(status)}>
                            {getStatusTag(status)}
                        </Option>
                    ))}
                    <Option value="__custom__">{getStatusTag("Estado personalizado...")}</Option>
                </Select>
                {isCustomStatus && (
                    <Input
                        placeholder="Estado personalizado"
                        value={customStatusValue}
                        onChange={handleCustomStatusInput}
                        className="mt-2"
                    />
                )}
            </div>

            {/* Recursos adjuntos */}
            <div className="flex flex-col w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Recursos</label>
                <Select
                    placeholder="Todos"
                    value={filters.has_recurso || undefined}
                    onChange={(value) => onChange("has_recurso", value)}
                    allowClear
                    className="w-full sm:w-[140px]"
                >
                    <Option value="yes">Con archivos</Option>
                    <Option value="no">Sin archivos</Option>
                </Select>
            </div>

            {/* Botón limpiar */}
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

// Utilidad para mostrar con mayúscula inicial
const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

export default TaskFilters;
