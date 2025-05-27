from pydantic import (
    BaseModel,
    Field,
    EmailStr,
    field_validator,
)
from typing import Optional, List, Literal
from bson import ObjectId
from datetime import datetime, date


# ================== VALIDADOR DE OBJECTID ==================
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args, **kwargs):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


# ================== MODELO DE COLABORADOR ==================
class Collaborator(BaseModel):
    email: EmailStr
    permission: Literal["read", "write", "admin"] = "read"


# ================== MODELO DE TAREA ==================
class Task(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    description: Optional[str] = None
    completed: bool = False
    creator: Optional[str] = "Desconocido"
    creator_name: Optional[str] = None
    collaborators: Optional[List[Collaborator]] = []
    startDate: Optional[datetime] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = "pendiente" # Estados: pendiente, en espera, lista para comenzar, en progreso, en revisión, completado. También se permite estado personalizado.

    projectId: Optional[PyObjectId] = None
    user_id: Optional[str] = None
    user_email: Optional[EmailStr] = None

    @field_validator("startDate", "deadline", mode="before")
    @classmethod
    def validate_dates(cls, value):
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, date):
            # Convertir date a datetime (medianoche)
            return datetime.combine(value, datetime.min.time())

        if isinstance(value, str):
            # Limpiar la cadena
            value = value.strip()
            if not value:
                return None

            # Intentar diferentes formatos de fecha
            formats_to_try = [
                "%Y-%m-%d",  # Formato simple: 2024-12-25
                "%Y-%m-%dT%H:%M:%S.%fZ",  # ISO con microsegundos y Z
                "%Y-%m-%dT%H:%M:%SZ",  # ISO con Z
                "%Y-%m-%dT%H:%M:%S.%f",  # ISO con microsegundos
                "%Y-%m-%dT%H:%M:%S",  # ISO simple
                "%Y-%m-%d %H:%M:%S",  # Formato con espacio
            ]

            for fmt in formats_to_try:
                try:
                    return datetime.strptime(value, fmt)
                except ValueError:
                    continue

            # Si falla con strptime, intentar con fromisoformat
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                pass

            # Si todo falla, lanzar error descriptivo
            raise ValueError(
                f"Formato de fecha no válido: {value}. Formatos aceptados: YYYY-MM-DD o ISO 8601"
            )

        return value

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
        }


# ================== MODELO DE ACTUALIZACIÓN DE TAREA ==================
class UpdateTask(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    creator: Optional[str] = None
    creator_name: Optional[str] = None
    collaborators: Optional[List[Collaborator]] = None
    startDate: Optional[datetime] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None # Estados + personalizado
    projectId: Optional[PyObjectId] = None

    @field_validator("startDate", "deadline", mode="before")
    @classmethod
    def validate_dates(cls, value):
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, date):
            # Convertir date a datetime (medianoche)
            return datetime.combine(value, datetime.min.time())

        if isinstance(value, str):
            # Limpiar la cadena
            value = value.strip()
            if not value:
                return None

            # Intentar diferentes formatos de fecha
            formats_to_try = [
                "%Y-%m-%d",  # Formato simple: 2024-12-25
                "%Y-%m-%dT%H:%M:%S.%fZ",  # ISO con microsegundos y Z
                "%Y-%m-%dT%H:%M:%SZ",  # ISO con Z
                "%Y-%m-%dT%H:%M:%S.%f",  # ISO con microsegundos
                "%Y-%m-%dT%H:%M:%S",  # ISO simple
                "%Y-%m-%d %H:%M:%S",  # Formato con espacio
            ]

            for fmt in formats_to_try:
                try:
                    return datetime.strptime(value, fmt)
                except ValueError:
                    continue

            # Si falla con strptime, intentar con fromisoformat
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                pass

            # Si todo falla, lanzar error descriptivo
            raise ValueError(
                f"Formato de fecha no válido: {value}. Formatos aceptados: YYYY-MM-DD o ISO 8601"
            )

        return value

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
        }


# ================== MODELO DE PROYECTO ==================
class Project(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    description: Optional[str] = None
    user_id: Optional[str] = None
    user_email: Optional[EmailStr] = None
    collaborators: Optional[List[Collaborator]] = []

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ================== MODELOS DE USUARIO ==================
class UserBase(BaseModel):
    first_name: str
    last_name: str
    address: str
    postal_code: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    profile_image: Optional[str] = None  # Soporte para imagen base64

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
