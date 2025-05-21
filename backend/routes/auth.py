from fastapi import (
    APIRouter,
    HTTPException,
    status,
    Depends,
    Body,
    Form,
    UploadFile,
    File,
)
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
from bson import ObjectId
import base64

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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
        user["_id"] = user_id

        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


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
            "user_id": str(authenticated_user["_id"]),
            "first_name": authenticated_user.get("first_name", ""),
            "last_name": authenticated_user.get("last_name", ""),
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    if current_user.get("profile_image"):
        current_user["profile_image"] = base64.b64encode(
            current_user["profile_image"]
        ).decode("utf-8")
    return current_user


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
            "user_id": str(user["_id"]),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "address": user.get("address", ""),
            "postal_code": user.get("postal_code", ""),
        },
        expires_delta=timedelta(minutes=15),
    )
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    await send_reset_email(data.email, reset_link)

    return {
        "message": "Se ha enviado un correo para restablecer tu contraseña.",
    }


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


@router.put("/profile")
async def update_profile(
    first_name: str = Form(None),
    last_name: str = Form(None),
    address: str = Form(None),
    postal_code: str = Form(None),
    email: EmailStr = Form(None),
    password: str = Form(None),
    profileImage: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
):
    update_fields = {}

    if first_name:
        update_fields["first_name"] = first_name
    if last_name:
        update_fields["last_name"] = last_name
    if address:
        update_fields["address"] = address
    if postal_code:
        update_fields["postal_code"] = postal_code
    if email:
        update_fields["email"] = email
    if password:
        update_fields["password"] = pwd_context.hash(password)

    if profileImage:
        image_content = await profileImage.read()
        print(f"[DEBUG] Imagen recibida: {len(image_content)} bytes")
        update_fields["profile_image"] = image_content

    if not update_fields:
        raise HTTPException(status_code=400, detail="No hay cambios para actualizar")

    await user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])}, {"$set": update_fields}
    )

    return {"message": "Perfil actualizado correctamente"}


@router.delete("/delete")
async def delete_account(current_user: dict = Depends(get_current_user)):
    await user_collection.delete_one({"_id": ObjectId(current_user["_id"])})
    return {"message": "Cuenta eliminada correctamente"}
