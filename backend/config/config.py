import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import HTTPException, status

# ================== CARGA DE VARIABLES DE ENTORNO ==================
load_dotenv()

# ================== FRONTEND ==================
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ================== JWT CONFIG ==================
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definido en el archivo .env")


# ================== CREAR TOKEN ==================
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Genera un token JWT válido con datos y expiración."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ================== DECODIFICAR TOKEN ==================
def decode_access_token(token: str) -> dict:
    """
    Devuelve el payload completo con campos como 'sub', 'first_name', 'last_name', etc.
    """
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
