import {
    CloseCircleOutlined,
    DeleteOutlined,
    SaveOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { Button, Col, Input, message, Modal, Row, Upload } from "antd";
import { useEffect, useState } from "react";
import { deleteAccount, getCurrentUser, updateProfile } from "../../../api/auth";
import heic2any from "heic2any";

const ProfileForm = () => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        address: "",
        postal_code: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImage: null,
        profileImageBase64: null,
    });

    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };


    // Al montar el componente, obtener los datos actuales del usuario
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                console.log(" Usuario cargado:", user);
                const initialState = {
                    ...user,
                    password: "",
                    confirmPassword: "",
                    profileImage: null,
                    address: user.address || "",
                    postal_code: user.postal_code || "",
                };
                setFormData(initialState);
                setOriginalData(initialState);
            } catch (error) {
                message.error("Error al cargar datos del usuario");
            }
        };
        fetchUser();
    }, []);

    // Actualiza el estado del formulario cuando cambia un campo
    const handleSave = async () => {
        const formDataCopy = { ...formData };

        // Eliminamos confirmPassword para no enviarlo al backend
        delete formDataCopy.confirmPassword;

        // Eliminamos password si está vacío
        if (formDataCopy.password === "") {
            delete formDataCopy.password;
        }

        // ===================== CONVERSIÓN BASE64 DE IMAGEN =====================
        console.log("Estado antes de conversión base64:", formData.profileImageBase64);

        // Convertimos y añadimos profile_image_base64
        formDataCopy.profile_image_base64 =
            formData.profileImageBase64 === "" ? "" :
                formData.profileImageBase64 ? formData.profileImageBase64 : null;

        console.log("Valor enviado como profile_image_base64:", formDataCopy.profile_image_base64);


        delete formDataCopy.profileImageBase64;

        // Comprobamos cambios
        const originalCopy = { ...originalData };
        const hasChanges = Object.keys(formDataCopy).some((key) => {
            if (key === "profile_image_base64") return true; // importante siempre enviar
            return formDataCopy[key] !== originalCopy[key];
        });

        const eliminarImagen = formData.profileImageBase64 === "";

        if (!hasChanges && !eliminarImagen) {
            message.info("No se detectaron cambios. Recargando...");
            window.location.reload();
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            return message.error("Las contraseñas no coinciden");
        }

        try {
            setLoading(true);
            console.log("Enviando al backend:", formDataCopy);
            await updateProfile(formDataCopy);
            console.log("JSON final enviado al backend (como JSON):", JSON.stringify(formDataCopy, null, 2));
            message.success("Perfil actualizado correctamente");
            window.location.reload();
        } catch (err) {
            console.error("Error al actualizar el perfil:", err);
            message.error("Error al actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };




    // Confirma y elimina la cuenta del usuario
    const handleDelete = async () => {
        Modal.confirm({
            title: "¿Estás seguro de eliminar tu cuenta?",
            okText: "Sí, eliminar",
            okType: "danger",
            cancelText: "Cancelar",
            onOk: async () => {
                try {
                    await deleteAccount();
                    message.success("Cuenta eliminada");
                    window.location.href = "/login";
                } catch {
                    message.error("Error al eliminar la cuenta");
                }
            },
        });
    };

    // Elimina la imagen de perfil cargada
    const handleRemoveImage = () => {
        console.log("🗑️ Eliminando imagen de perfil...");

        // Regenera avatar genérico basado en nombre
        const avatarGenerico = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${formData.first_name || ''} ${formData.last_name || ''}`
        )}&background=random`;

        setFormData((prev) => ({
            ...prev,
            profileImage: null, // Limpiamos el archivo de imagen
            profileImageBase64: "", // Enviar string vacío, no null
            profile_image: null, //Limpia la imagen del backend (visual)
        }));

        setPreviewImage(avatarGenerico); //  Vuelve a mostrar el avatar por nombre
    };




    return (
        <div className="w-full bg-[#f5f5f6] dark:bg-[#2a2e33] text-black dark:text-white rounded-lg space-y-6 p-4 overflow-x-auto overflow-y-visible min-h-[400px]">

            {/* Vista previa de la imagen de perfil + acciones */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6 text-center">
                {previewImage || (formData.profile_image && typeof formData.profile_image === "string") ? (
                    <img
                        src={previewImage || `data:image/jpeg;base64,${formData.profile_image}`}
                        alt="Perfil"
                        className="w-24 h-24 object-cover rounded-full border bg-white dark:bg-white"
                    />
                ) : null}

                {/* Subida de nueva imagen de perfil - Base64 */}
                <Upload
                    beforeUpload={async (file) => {
                        const allowedTypes = [
                            "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
                            "image/svg+xml", "image/svg", "image/svgz", "image/tiff"
                        ];

                        const isHeicFile = file.name?.toLowerCase().endsWith(".heic") || file.name?.toLowerCase().endsWith(".heif");

                        const isAllowed = allowedTypes.includes(file.type) || isHeicFile;

                        const MAX_IMAGE_SIZE_MB = 3;
                        const isSmallEnough = file.size / 1024 / 1024 <= MAX_IMAGE_SIZE_MB;

                        if (!isAllowed) {
                            message.error("Formato no permitido. Usa: JPG, PNG, WebP, GIF, BMP, SVG (HEIC será convertido)");
                            return false;
                        }

                        if (!isSmallEnough) {
                            message.error(`La imagen debe pesar menos de ${MAX_IMAGE_SIZE_MB}MB`);
                            return false;
                        }

                        let finalFile = file;

                        // Conversión HEIC a JPEG
                        if (isHeicFile) {
                            try {
                                const outputBlob = await heic2any({
                                    blob: file,
                                    toType: "image/jpeg",
                                    quality: 0.95,
                                });

                                finalFile = new File([outputBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                                    type: "image/jpeg",
                                });

                                message.info("Imagen HEIC convertida a JPG automáticamente.");
                            } catch (err) {
                                console.error("Error al convertir imagen HEIC:", err);
                                message.error("No se pudo convertir la imagen HEIC");
                                return false;
                            }
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const result = reader.result;
                                if (typeof result === "string") {
                                    const base64 = result.split(",")[1];
                                    setFormData((prev) => ({
                                        ...prev,
                                        profileImage: finalFile,
                                        profileImageBase64: base64,
                                    }));
                                    setPreviewImage(URL.createObjectURL(finalFile));
                                }
                            } catch (err) {
                                message.error("Error al procesar la imagen");
                            }
                        };
                        reader.readAsDataURL(finalFile);

                        return false;
                    }}

                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />} style={{ backgroundColor: "#F1F1F1", borderColor: "#DADADA" }}>
                        Subir imagen
                    </Button>
                </Upload>

                {/* Eliminar imagen cargada */}
                {(previewImage || formData.profileImage || formData.profile_image) && (
                    <Button icon={<CloseCircleOutlined />} onClick={handleRemoveImage} danger size="small">
                        Eliminar imagen de perfil
                    </Button>
                )}

                {/* Nombre completo del usuario */}
                <h2 className="text-3xl font-bold text-black dark:text-white mt-4">
                    {formData.first_name} {formData.last_name}
                </h2>
            </div>

            {/* Campos del formulario */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <label className="inline-block font-medium mb-1 dark:text-white w-fit">Nombre</label>
                    <Input
                        value={formData.first_name}
                        onChange={(e) => handleChange("first_name", e.target.value)}
                        placeholder="Nombre"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <label className="inline-block font-medium mb-1 dark:text-white w-fit">Apellidos</label>
                    <Input
                        value={formData.last_name}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                        placeholder="Apellidos"
                    />
                </Col>
            </Row>

            <div className="mt-4">
                <label className="inline-block font-medium mb-1 dark:text-white w-fit">Email</label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Correo electrónico"
                />
            </div>

            <div className="mt-4">
                <label className="inline-block font-medium mb-1 dark:text-white w-fit">Dirección</label>
                <Input
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Dirección"
                />
            </div>

            <div className="mt-4">
                <label className="inline-block font-medium mb-1 dark:text-white w-fit">Código Postal</label>
                <Input
                    value={formData.postal_code}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                    placeholder="Código Postal"
                />
            </div>

            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                    <label className="inline-block font-medium mb-1 dark:text-white w-fit">Contraseña</label>
                    <Input.Password
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Nueva contraseña"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <label className="inline-block font-medium mb-1 dark:text-white w-fit">Repetir Contraseña</label>
                    <Input.Password
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Confirmar contraseña"
                    />
                </Col>
            </Row>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-4 justify-end mt-8">
                <Button
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleSave}
                    style={{
                        background: '#FFFFFF',
                        borderColor: '#3B82F6',
                        color: '#3B82F6',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '6px',
                    }}
                >
                    Guardar
                </Button>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#ff4d4f',
                        color: '#ff4d4f',
                        fontWeight: 'bold',
                    }}
                >
                    Eliminar Cuenta
                </Button>
            </div>
        </div>
    );
};

export default ProfileForm;
