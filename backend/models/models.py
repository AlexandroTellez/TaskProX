from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from bson import ObjectId
from datetime import datetime

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
    status: Optional[str] = "Pendiente"
    projectId: Optional[PyObjectId] = None
    user_id: Optional[str] = None
    user_email: Optional[EmailStr] = None

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
    collaborators: Optional[List[Collaborator]] = None
    startDate: Optional[datetime] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    projectId: Optional[PyObjectId] = None

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
