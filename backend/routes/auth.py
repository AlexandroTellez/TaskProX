from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import EmailStr, BaseModel
from datetime import timedelta
from models.models import UserCreate, UserLogin, UserOut
from config.database import (
    create_user,
    authenticate_user,
    get_user_by_email,
    user_collection,
    pwd_context,
)
from config.config import create_access_token, decode_access_token, FRONTEND_URL
from config.email_utils import send_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ================== FUNCIÓN GLOBAL PARA USUARIOS AUTENTICADOS ==================


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")

        user = await get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Agregamos los datos del token al objeto de usuario
        user["first_name"] = payload.get("first_name", "")
        user["last_name"] = payload.get("last_name", "")

        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ================== REGISTRO ==================


@router.post("/register")
async def register(user: UserCreate):
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado.",
        )

    user_id = await create_user(user)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"message": "Usuario registrado correctamente", "user_id": user_id},
    )


# ================== LOGIN ==================


@router.post("/login")
async def login(user: UserLogin):
    authenticated_user = await authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas"
        )

    access_token = create_access_token(
        data={
            "sub": authenticated_user["email"],
            "first_name": authenticated_user.get("first_name", ""),
            "last_name": authenticated_user.get("last_name", ""),
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ================== RUTA PROTEGIDA: /auth/me ==================


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


# ================== OLVIDAR CONTRASEÑA ==================


class EmailRequest(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
async def forgot_password(data: EmailRequest):
    user = await get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    token = create_access_token(
        {
            "sub": user["email"],
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
        },
        expires_delta=timedelta(minutes=15),
    )
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    await send_reset_email(data.email, reset_link)

    return {
        "message": "Se ha enviado un correo para restablecer tu contraseña.",
    }


# ================== RESTABLECER CONTRASEÑA ==================


@router.post("/reset-password")
async def reset_password(
    token: str = Body(...),
    password: str = Body(...),
):
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Token inválido")

        user = await get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        hashed_password = pwd_context.hash(password)
        await user_collection.update_one(
            {"email": email}, {"$set": {"password": hashed_password}}
        )
        return {"message": "Contraseña actualizada correctamente"}
    except Exception:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
