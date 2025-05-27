import { Select, Input } from 'antd';
import { useState, useEffect } from 'react';
import { getStatusTag } from '../list/utils'; // Importamos la función para mostrar colores

const { Option } = Select;

// Estados predefinidos
const predefinedStatuses = [
    "pendiente",
    "en espera",
    "lista para comenzar",
    "en progreso",
    "en revisión",
    "completado",
];

const StatusSelector = ({ value, onChange }) => {
    const [customStatus, setCustomStatus] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        if (value && !predefinedStatuses.includes(value.toLowerCase())) {
            setIsCustom(true);
            setCustomStatus(value);
        } else {
            setIsCustom(false);
        }
    }, [value]);

    const handleSelectChange = (val) => {
        if (val === '__custom__') {
            setIsCustom(true);
            setCustomStatus('');
            onChange('');
        } else {
            setIsCustom(false);
            onChange(val);
        }
    };

    const handleCustomInput = (e) => {
        const val = e.target.value;
        setCustomStatus(val);
        onChange(val);
    };

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-black dark:text-white">Estado</h2>
            <Select
                value={isCustom ? '__custom__' : value}
                onChange={handleSelectChange}
                className="w-full"
                placeholder="Selecciona un estado"
            >
                {predefinedStatuses.map((status) => (
                    <Option key={status} value={capitalize(status)}>
                        {getStatusTag(status)}
                    </Option>
                ))}
                <Option value="__custom__">{getStatusTag("Otro...")}</Option>
            </Select>

            {isCustom && (
                <Input
                    placeholder="Escribe un estado personalizado"
                    value={customStatus}
                    onChange={handleCustomInput}
                    className="mt-2"
                />
            )}
        </div>
    );
};

// Función para capitalizar
const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

export default StatusSelector;
