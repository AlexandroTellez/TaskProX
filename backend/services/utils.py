from datetime import datetime, timezone
from dateutil.parser import parse as parse_datetime
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


# ================== Parseo seguro de fechas ==================
def parse_date_safe(date_str: str) -> datetime | None:
    """
    Intenta parsear una cadena a datetime (en UTC, a medianoche).
    Si falla, retorna None.
    """
    try:
        dt = parse_datetime(date_str)
        return dt.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(
            timezone.utc
        )
    except Exception as e:
        print(f"[!] Error al parsear fecha: {date_str} -> {e}")
        return None


# ================== Helper para aplicar formato UTC a fechas datetime ==================
def format_utc_midnight(date_obj: datetime) -> datetime:
    """
    Ajusta una fecha datetime a la medianoche en UTC.
    """
    return date_obj.astimezone(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
