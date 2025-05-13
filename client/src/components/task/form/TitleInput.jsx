import { Input } from 'antd';

const TitleInput = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Título</h2>
            <Input.TextArea
                placeholder="Título"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="break-words whitespace-normal resize-none"
            />
        </div>
    );
};

export default TitleInput;