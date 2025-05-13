import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const DescriptionEditor = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Descripción</h2>
            <div className="bg-white rounded text-black">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    placeholder="Descripción de la tarea..."
                    modules={{
                        toolbar: [
                            [{ header: [1, 2, false] }],
                            ['bold', 'italic', 'underline'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['clean']
                        ]
                    }}
                />
            </div>
        </div>
    );
};

export default DescriptionEditor;