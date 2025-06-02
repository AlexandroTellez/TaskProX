import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload, Tooltip } from 'antd';
import { useState } from 'react';

// Tipos MIME permitidos
const acceptedTypes = [
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip", "application/x-zip-compressed",
    "application/x-rar-compressed", "application/x-7z-compressed",
    "application/x-gzip", "application/x-bzip2",
    "image/jpeg", "image/png", "image/gif", "image/svg+xml",
    "image/webp", "image/tiff", "image/bmp",
    "image/x-icon", "image/heic", "image/heif",
    "image/jfif", "image/vnd.microsoft.icon",
    "image/x-portable-anymap", "image/x-portable-bitmap",
    "image/x-portable-graymap", "image/x-portable-pixmap",
    "image/x-xbitmap", "image/x-xpixmap",
];

const MAX_FILES = 2;
const MAX_FILE_SIZE_MB = 7.5;
const MAX_TOTAL_SIZE_MB = 15;

function FileUploader({ recurso = [], setRecurso }) {
    const [errorTooltip, setErrorTooltip] = useState(null);

    const getTotalSize = (files) =>
        files.reduce((acc, file) => acc + (file.size || 0), 0);

    const handleBeforeUpload = (file) => {
        setErrorTooltip(null);

        const isAccepted = acceptedTypes.includes(file.type) || file.type.startsWith('image/');
        if (!isAccepted) {
            const msg = `❌ El formato del archivo "${file.name}" no es permitido.`;
            message.error(msg);
            setErrorTooltip(msg);
            return Upload.LIST_IGNORE;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            const msg = `❌ El archivo "${file.name}" supera los ${MAX_FILE_SIZE_MB}MB permitidos.`;
            message.error(msg);
            setErrorTooltip(msg);
            return Upload.LIST_IGNORE;
        }

        if (recurso.length >= MAX_FILES) {
            const msg = `⚠️ Solo puedes adjuntar hasta ${MAX_FILES} archivos.`;
            message.warning(msg);
            setErrorTooltip(msg);
            return Upload.LIST_IGNORE;
        }

        const totalSizeMB = (getTotalSize([...recurso, file]) / (1024 * 1024)).toFixed(2);
        if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
            const msg = `❌ El peso total supera los ${MAX_TOTAL_SIZE_MB}MB (actual: ${totalSizeMB}MB).`;
            message.error(msg);
            setErrorTooltip(msg);
            return Upload.LIST_IGNORE;
        }

        const isDuplicate = recurso.some((f) => {
            if (typeof f === 'string') return f === file.name;
            return f.name === file.name && f.lastModified === file.lastModified;
        });
        if (isDuplicate) {
            const msg = `⚠️ El archivo "${file.name}" ya fue añadido.`;
            message.warning(msg);
            setErrorTooltip(msg);
            return Upload.LIST_IGNORE;
        }

        setRecurso([...recurso, file]);
        return false;
    };

    const handleRemove = (file) => {
        setRecurso(
            recurso.filter((f) => {
                const name = typeof f === 'string' ? f : f.name;
                return name !== file.name;
            })
        );
        setErrorTooltip(null);
    };

    return (
        <div className="space-y-2">
            <label className="text-xl font-semibold text-black dark:text-white block">
                Adjuntar Recursos
            </label>

            <Tooltip
                title={errorTooltip}
                color="red"
                open={!!errorTooltip}
                placement="top"
            >
                <Upload
                    beforeUpload={handleBeforeUpload}
                    onRemove={handleRemove}
                    fileList={recurso.map((file, index) => ({
                        uid: `${index}`,
                        name: typeof file === 'string' ? file : file.name,
                        status: 'done',
                    }))}
                    accept={`
                        .pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,
                        .zip,.rar,.7z,.gz,.bz2,
                        .png,.jpg,.jpeg,.gif,.svg,.webp,.tiff,.bmp,.ico,.heic,.heif,.jfif
                    `}
                >
                    <Button icon={<UploadOutlined />} disabled={recurso.length >= MAX_FILES}>
                        Seleccionar archivo
                    </Button>
                </Upload>
            </Tooltip>

            <div className="border-t dark:border-white border-black my-4 opacity-20" />
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">
                <strong>Nota:</strong> Puedes subir hasta <strong>{MAX_FILES} archivos</strong>,
                con un tamaño máximo individual de <strong>{MAX_FILE_SIZE_MB}MB</strong> y
                un peso total combinado de <strong>{MAX_TOTAL_SIZE_MB}MB</strong>.
                <br />
                <strong>Formatos permitidos:</strong>{' '}
                <code>.pdf, .doc, .docx, .pptx, .xls, .xlsx, .zip, .rar, .png, .jpg, .jpeg, .gif, .svg, .webp, .heic, etc.</code>
            </p>
            <div className="border-t dark:border-white border-black my-4 opacity-20" />
        </div>
    );
}

export default FileUploader;
