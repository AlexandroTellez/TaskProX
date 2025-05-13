import { DatePicker, Checkbox } from 'antd';
import esES from 'antd/es/locale/es_ES';
import dayjs from 'dayjs';

const DatePickers = ({ startDate, deadline, noDeadline, onChange, setNoDeadline }) => {
    const handleDateChange = (field, date) => {
        console.log(`📅 Fecha seleccionada para ${field}:`, date?.format?.("dddd, DD/MM/YYYY") || 'nula');
        onChange(field, date);
    };

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Fechas</h2>
            <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                    <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Fecha de inicio"
                        value={dayjs.isDayjs(startDate) ? startDate : (startDate ? dayjs(startDate) : null)}
                        onChange={(date) => handleDateChange('startDate', date)}
                        format="DD/MM/YYYY"
                        locale={esES}
                        allowClear
                        disabledDate={() => false}
                    />
                    <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Fecha límite"
                        value={
                            noDeadline
                                ? null
                                : (dayjs.isDayjs(deadline) ? deadline : (deadline ? dayjs(deadline) : null))
                        }
                        onChange={(date) => handleDateChange('deadline', date)}
                        disabled={noDeadline}
                        format="DD/MM/YYYY"
                        locale={esES}
                        allowClear
                        disabledDate={() => false}
                    />
                </div>
                <div className="flex justify-end">
                    <Checkbox
                        className="text-black"
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
