from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

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

# ================== MODELO DE TAREA ==================

class Task(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    description: Optional[str] = None
    completed: bool = False
    creator: Optional[str] = "Desconocido"
    startDate: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = "Pendiente"
    progress: Optional[int] = 0
    projectId: Optional[PyObjectId] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ================== MODELO DE ACTUALIZACIÓN DE TAREA ==================

class UpdateTask(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    creator: Optional[str] = None
    startDate: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    projectId: Optional[PyObjectId] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ================== MODELO DE PROYECTO ==================

class Project(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
