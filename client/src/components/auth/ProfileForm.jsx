import { useEffect, useState } from "react";
import { Input, Button, Upload, message, Modal, Row, Col } from "antd";
import {
    UploadOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { updateProfile, deleteAccount, getCurrentUser } from "../../api/auth";

const ProfileForm = () => {
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

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                const initialState = {
                    ...user,
                    password: "",
                    confirmPassword: "",
                    profileImage: null,
                };
                setFormData(initialState);
                setOriginalData(initialState);
            } catch (error) {
                message.error("Error al cargar datos del usuario");
            }
        };
        fetchUser();
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

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

    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            profileImage: null,
        }));
        setPreviewImage(null);
    };

    return (
        <div className="p-4 sm:p-6 bg-white text-black rounded-lg shadow-md max-w-6xl mx-auto w-full">
            {/* Imagen + subir imagen */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                {previewImage || (formData.profile_image && typeof formData.profile_image === "string") ? (
                    <img
                        src={previewImage || `data:image/jpeg;base64,${formData.profile_image}`}
                        alt="Perfil"
                        className="w-24 h-24 object-cover rounded-full border"
                    />
                ) : null}

                <div className="flex flex-col items-center sm:items-start gap-2">
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

                    {(previewImage || formData.profileImage) && (
                        <Button icon={<CloseCircleOutlined />} onClick={handleRemoveImage} danger size="small">
                            Eliminar imagen
                        </Button>
                    )}
                </div>
            </div>

            {/* Título */}
            <h2 className="text-3xl font-bold text-black mb-6 text-center sm:text-left">
                Cuenta: {formData.first_name} {formData.last_name}
            </h2>

            {/* Datos del perfil */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <label className="block font-medium mb-1">First Name</label>
                    <Input
                        value={formData.first_name}
                        onChange={(e) => handleChange("first_name", e.target.value)}
                        placeholder="Nombre"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <label className="block font-medium mb-1">Last Name</label>
                    <Input
                        value={formData.last_name}
                        onChange={(e) => handleChange("last_name", e.target.value)}
                        placeholder="Apellidos"
                    />
                </Col>
            </Row>

            <div className="mt-4">
                <label className="block font-medium mb-1">Email</label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Correo electrónico"
                />
            </div>

            <div className="mt-4">
                <label className="block font-medium mb-1">Address</label>
                <Input
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Dirección"
                />
            </div>

            <div className="mt-4">
                <label className="block font-medium mb-1">Código Postal</label>
                <Input
                    value={formData.postal_code}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                    placeholder="Código Postal"
                />
            </div>

            <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                    <label className="block font-medium mb-1">Contraseña</label>
                    <Input.Password
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Nueva contraseña"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <label className="block font-medium mb-1">Repetir Contraseña</label>
                    <Input.Password
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Confirmar contraseña"
                    />
                </Col>
            </Row>

            <div className="flex flex-wrap gap-4 justify-end mt-8">
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleSave}
                    className="bg-yellow-400 text-black font-semibold px-6 hover:!bg-yellow-400 border-none"
                >
                    Guardar
                </Button>
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    className="font-semibold px-6"
                >
                    Eliminar Cuenta
                </Button>
            </div>
        </div>
    );
};

export default ProfileForm;