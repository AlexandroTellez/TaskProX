import { Select } from 'antd';

const { Option } = Select;

const StatusSelector = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Estado</h2>
            <Select
                value={value}
                onChange={onChange}
                className="w-full"
            >
                <Option value="Pendiente">Pendiente</Option>
                <Option value="En proceso">En proceso</Option>
                <Option value="Completado">Completado</Option>
            </Select>
        </div>
    );
};

export default StatusSelector;