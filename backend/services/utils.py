from passlib.context import CryptContext

# ================== Encriptador de contraseñas ==================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ================== Normalización de estados ==================
def normalize_status(status: str) -> str:
    status = str(status).strip().lower()
    return {
        "completado": "Completado",
        "en proceso": "En proceso",
        "pendiente": "Pendiente",
        "en espera": "En espera",
        "cancelado": "Cancelado",
    }.get(status, "Pendiente")