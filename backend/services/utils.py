from passlib.context import CryptContext

# ================== Encriptador de contraseñas ==================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ================== Normalización de estados ==================
def normalize_status(status: str) -> str:
    """
    Normaliza los estados conocidos al formato con mayúscula inicial.
    Si el estado no está en la lista, lo devuelve con capitalización (título).
    """
    status = str(status).strip().lower()

    mapping = {
        "pendiente": "Pendiente",
        "en espera": "En espera",
        "lista para comenzar": "Lista para comenzar",
        "en progreso": "En progreso",
        "en revisión": "En revisión",
        "completado": "Completado",
        "cancelado": "Cancelado",
    }

    return mapping.get(
        status, status.title()
    )  # Permitir estados personalizados (ej. "Bloqueado" => "Bloqueado")