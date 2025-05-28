import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';

const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
];

const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 5;

function FileUploader({ recurso = [], setRecurso }) {
    // Validación antes de subir
    const handleBeforeUpload = (file) => {
        const isAccepted =
            acceptedTypes.includes(file.type) || file.type.startsWith("image/");

        if (!isAccepted) {
            message.error(`❌ El formato del archivo "${file.name}" no es permitido.`);
            return Upload.LIST_IGNORE;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            message.error(`❌ El archivo "${file.name}" supera los ${MAX_FILE_SIZE_MB}MB.`);
            return Upload.LIST_IGNORE;
        }

        if (recurso.length >= MAX_FILES) {
            message.warning(`⚠️ Límite de archivos alcanzado (máx. ${MAX_FILES}).`);
            return Upload.LIST_IGNORE;
        }

        const isDuplicate = recurso.some(
            (f) => (typeof f === 'string' ? f === file.name : f.name === file.name)
        );
        if (isDuplicate) {
            message.warning(`⚠️ El archivo "${file.name}" ya fue añadido.`);
            return Upload.LIST_IGNORE;
        }

        setRecurso([...recurso, file]);
        return false;
    };

    const handleRemove = (file) => {
        setRecurso(
            recurso.filter((f) => {
                if (typeof f === 'string') return f !== file.name;
                return f.name !== file.name;
            })
        );
    };

    return (
        <div className="space-y-2">
            <label className="text-xl font-semibold text-black dark:text-white block">Adjuntar Recursos</label>
            <div>
                <Upload
                    beforeUpload={handleBeforeUpload}
                    onRemove={handleRemove}
                    fileList={recurso.map((file, index) => ({
                        uid: index.toString(),
                        name: typeof file === 'string' ? file : file.name,
                        status: 'done',
                    }))}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.svg,.raw"
                >
                    <Button icon={<UploadOutlined />} disabled={recurso.length >= MAX_FILES}>
                        Seleccionar archivo
                    </Button>
                </Upload>
                <div className="border-t dark:border-white border-black my-4 opacity-20" />
                <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">
                    <strong> Nota: </strong>Puedes subir hasta <strong>{MAX_FILES} archivos</strong> con un tamaño máximo por archivo de <strong>{MAX_FILE_SIZE_MB}MB</strong>.
                    <br />
                    <strong>Formatos permitidos:</strong><code>.pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg, .gif, .svg, .raw</code>
                </p>
                <div className="border-t dark:border-white border-black my-4 opacity-20" />
            </div>
        </div>
    );
}

export default FileUploader;
