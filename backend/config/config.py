import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import HTTPException, status

# ================== CARGA DE VARIABLES DE ENTORNO ==================
load_dotenv()

# ================== ENTORNO Y FRONTEND ==================
ENV = os.getenv("ENV", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Lista dinámica de orígenes permitidos (usada en main.py)
if ENV == "production":
    ALLOWED_ORIGINS = ["https://task-pro-x.vercel.app"]
else:
    ALLOWED_ORIGINS = ["http://localhost:5173"]

# ================== JWT CONFIG ==================
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# Expiraciones personalizadas
ACCESS_TOKEN_EXPIRE_MINUTES_DEFAULT = 480  # 8 horas para usuarios sin "recuérdame"
ACCESS_TOKEN_EXPIRE_MINUTES_REMEMBER = 43200  # 30 días para usuarios con "recuérdame"

if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definido en el archivo .env")

# ================== CREAR TOKEN ==================
def create_access_token(data: dict, remember_me: bool = False):
    """
    Genera un token JWT con expiración personalizada según si el usuario activó "Recuérdame".
    """
    to_encode = data.copy()
    expire_minutes = (
        ACCESS_TOKEN_EXPIRE_MINUTES_REMEMBER
        if remember_me
        else ACCESS_TOKEN_EXPIRE_MINUTES_DEFAULT
    )
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ================== DECODIFICAR TOKEN ==================
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: no contiene 'sub'",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
