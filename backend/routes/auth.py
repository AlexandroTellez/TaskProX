from fastapi import (
    APIRouter,
    HTTPException,
    status,
    Depends,
    Body,
    Form,
    UploadFile,
    File,
    Request,
)
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import EmailStr, BaseModel
from bson import ObjectId
import base64

from models.models import UserCreate, UserLogin, UserOut
from config.database import user_collection
from config.config import create_access_token, decode_access_token, FRONTEND_URL
from config.email_utils import send_reset_email
from typing import Annotated
from services.auth_service import (
    create_user,
    get_user_by_email,
    authenticate_user,
    pwd_context,
)

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ========== OBTENER USUARIO ACTUAL DESDE TOKEN ==========
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        user_id = payload.get("user_id")

        if not email or not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")

        user = await get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        user["first_name"] = payload.get("first_name", "")
        user["last_name"] = payload.get("last_name", "")
        user["_id"] = str(user["_id"])  # Asegura que se conserve como string

        return {
            "id": str(user["_id"]),  # Clave necesaria para proyectos
            "email": user["email"],
            "first_name": payload.get("first_name", ""),
            "last_name": payload.get("last_name", ""),
            "address": user.get("address", ""),
            "postal_code": user.get("postal_code", ""),
            "profile_image": user.get("profile_image", None),
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ========== REGISTRO ==========


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


# ========== LOGIN ==========

@router.post("/login")
async def login(user: UserLogin, request: Request):
    authenticated_user = await authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas"
        )

    body = await request.json()
    remember_me = body.get("rememberMe", False)

    access_token = create_access_token(
        data={
            "sub": authenticated_user["email"],
            "user_id": str(authenticated_user["_id"]),
            "first_name": authenticated_user.get("first_name", ""),
            "last_name": authenticated_user.get("last_name", ""),
        },
        remember_me=remember_me,  # expiración respetando "Recuérdame"
        # Si remember_me es True, el token durará 30 días, de lo contrario 8 horas
    )

    return {"access_token": access_token, "token_type": "bearer"}


# ========== PERFIL DEL USUARIO ACTUAL ==========

@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    print("Solicitando datos del usuario:", current_user.get("email"))

    # Verificar si hay imagen guardada
    if current_user.get("profile_image"):
        print("Imagen encontrada, devolviendo base64.")
        current_user["profile_image"] = base64.b64encode(
            current_user["profile_image"]
        ).decode("utf-8")
    else:
        print("Sin imagen de perfil (None).")

    return current_user


# ========== RECUPERACIÓN DE CONTRASEÑA ==========


class EmailRequest(BaseModel):
    email: EmailStr

# ========== ENVIAR CORREO PARA RECUPERACIÓN DE CONTRASEÑA ==========
@router.post("/forgot-password")
async def forgot_password(data: EmailRequest):
    user = await get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    token = create_access_token(
        {
            "sub": user["email"],
            "user_id": str(user["_id"]),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "address": user.get("address", ""),
            "postal_code": user.get("postal_code", ""),
        },
        remember_me=False,  # Expiración corta para recuperación
    )
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    await send_reset_email(data.email, reset_link)

    return {"message": "Se ha enviado un correo para restablecer tu contraseña."}

# ========== RESTABLECER CONTRASEÑA ==========

@router.post("/reset-password")
async def reset_password(token: str = Body(...), password: str = Body(...)):
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

# ===============================
# Modelo para actualización de perfil
# ===============================
class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    address: str | None = None
    postal_code: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    profile_image_base64: str | None = None

# ========== ACTUALIZAR PERFIL ==========

@router.put("/profile")
async def update_profile(
    data: Annotated[ProfileUpdate, Body()],
    current_user: dict = Depends(get_current_user),
):
    update_fields = {}

    print("Datos recibidos del frontend:", data.model_dump())

    if data.first_name:
        update_fields["first_name"] = data.first_name
    if data.last_name:
        update_fields["last_name"] = data.last_name
    if data.address:
        update_fields["address"] = data.address
    if data.postal_code:
        update_fields["postal_code"] = data.postal_code
    if data.email:
        update_fields["email"] = data.email
    if data.password:
        update_fields["password"] = pwd_context.hash(data.password)

    # =============================
    # MANEJO DE IMAGEN DE PERFIL
    # =============================
    img = data.profile_image_base64
    if img is not None:
        if img == "":
            print("🧹 Solicitud de eliminación de imagen de perfil.")
            update_fields["profile_image"] = None
        else:
            try:
                print("Nueva imagen recibida, decodificando...")
                update_fields["profile_image"] = base64.b64decode(img)
            except Exception as e:
                print("Error al decodificar base64:", e)
                raise HTTPException(status_code=400, detail="Imagen no válida (base64 malformado)")

    if not update_fields:
        print("No hay cambios para actualizar.")
        raise HTTPException(status_code=400, detail="No hay cambios para actualizar")

    print("Actualizando en MongoDB:", update_fields.keys())

    await user_collection.update_one(
        {"_id": ObjectId(current_user["id"])}, {"$set": update_fields}
    )

    print("Perfil actualizado correctamente para:", current_user["email"])

    return {"message": "Perfil actualizado correctamente"}



# ========== ELIMINAR CUENTA ==========

@router.delete("/delete")
async def delete_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")  # ya viene del token como string

    if not user_id:
        raise HTTPException(status_code=400, detail="ID de usuario no disponible")

    await user_collection.delete_one({"_id": ObjectId(user_id)})
    return {"message": "Cuenta eliminada correctamente"}
