import { Checkbox, DatePicker } from 'antd';
import esES from 'antd/es/locale/es_ES';
import dayjs from 'dayjs';

/**
 * Componente para seleccionar la fecha de inicio y la fecha límite de una tarea.
 * - Mantiene las fechas como objetos dayjs hasta el envío final.
 * - Evita desfase por conversión a Date o UTC innecesariamente.
 */
const DatePickers = ({ startDate, deadline, noDeadline, onChange, setNoDeadline }) => {
    const handleDateChange = (field, date) => {
        const processedDate = date ? dayjs(date) : null;
        console.log(`Fecha procesada para ${field}:`, processedDate?.format("DD/MM/YYYY") || 'nula');
        onChange(field, processedDate);
    };

    const processDateValue = (dateValue) => {
        if (!dateValue) return null;
        if (dayjs.isDayjs(dateValue)) return dateValue;
        return dayjs(dateValue);
    };

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Fechas</h2>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Fecha de inicio */}
                    <DatePicker
                        className="w-full sm:w-[290px] sm:min-w-[200px]"
                        placeholder="Fecha de inicio"
                        value={processDateValue(startDate)}
                        onChange={(date) => handleDateChange('startDate', date)}
                        format="DD/MM/YYYY"
                        locale={esES}
                        allowClear
                    />

                    {/* Fecha límite */}
                    <DatePicker
                        className="w-full sm:w-[290px] sm:min-w-[200px]"
                        placeholder="Fecha límite"
                        value={noDeadline ? null : processDateValue(deadline)}
                        onChange={(date) => handleDateChange('deadline', date)}
                        disabled={noDeadline}
                        format="DD/MM/YYYY"
                        locale={esES}
                        allowClear
                    />
                    {/* Checkbox para indicar que no hay fecha límite */}
                    <Checkbox
                        className="self-center sm:self-center font-normal"
                        checked={noDeadline}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setNoDeadline(checked);
                            if (checked) onChange('deadline', null);
                        }}
                    >
                        Sin fecha límite.
                    </Checkbox>
                </div>

            </div>
        </div>
    );
};

export default DatePickers;
