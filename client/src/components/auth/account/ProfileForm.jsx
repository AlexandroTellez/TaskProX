import {
    CloseCircleOutlined,
    DeleteOutlined,
    SaveOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { Button, Col, Input, message, Modal, Row, Upload } from "antd";
import { useEffect, useState } from "react";
import { deleteAccount, getCurrentUser, updateProfile } from "../../../api/auth";

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
    });

    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Al montar el componente, obtener los datos actuales del usuario
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
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
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Guarda los cambios realizados en el perfil
    const handleSave = async () => {
        const formDataCopy = { ...formData };
        delete formDataCopy.profile_image;
        delete formDataCopy.profileImage;

        if (formDataCopy.password === "") delete formDataCopy.password;
        if (formDataCopy.confirmPassword === "") delete formDataCopy.confirmPassword;

        const originalCopy = { ...originalData };
        const hasChanges = Object.keys(formDataCopy).some(
            (key) => formDataCopy[key] !== originalCopy[key]
        );

        if (!hasChanges && !formData.profileImage) {
            message.info("No se detectaron cambios. Recargando...");
            window.location.reload();
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            return message.error("Las contraseñas no coinciden");
        }

        try {
            setLoading(true);
            await updateProfile(formData);
            message.success("Perfil actualizado correctamente");
            window.location.reload();
        } catch (err) {
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
        setFormData((prev) => ({
            ...prev,
            profileImage: null,
        }));
        setPreviewImage(null);
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

                {/* Subida de nueva imagen de perfil */}
                <Upload
                    beforeUpload={(file) => {
                        const allowedTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                            "image/gif",
                            "image/bmp",
                            "image/svg+xml"
                        ];
                        const isAllowed = allowedTypes.includes(file.type);
                        const isSmallEnough = file.size / 1024 / 1024 < 1;

                        if (!isAllowed) {
                            message.error("Formato no permitido. Usa: JPG, PNG, GIF, WebP, BMP o SVG");
                            return false;
                        }

                        if (!isSmallEnough) {
                            message.error("La imagen debe pesar menos de 1MB");
                            return false;
                        }

                        setFormData((prev) => ({ ...prev, profileImage: file }));
                        setPreviewImage(URL.createObjectURL(file));
                        return false;
                    }}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />} style={{ backgroundColor: "#F1F1F1", borderColor: "#DADADA" }}>
                        Subir imagen
                    </Button>
                </Upload>

                {/* Eliminar imagen cargada */}
                {(previewImage || formData.profileImage) && (
                    <Button icon={<CloseCircleOutlined />} onClick={handleRemoveImage} danger size="small">
                        Eliminar imagen
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
