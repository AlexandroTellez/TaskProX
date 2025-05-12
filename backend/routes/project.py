from fastapi import APIRouter, HTTPException, Depends
from config.database import (
    get_all_projects,
    get_project_by_id,
    create_project,
    update_project,
    delete_project,
    get_projects_with_progress
)

from models.models import Project
from bson import ObjectId
from routes.auth import get_current_user

project = APIRouter()

# Obtener todos los proyectos del usuario autenticado
@project.get("/api/projects")
async def list_projects(user: dict = Depends(get_current_user)):
    return await get_all_projects(user_id=str(user["_id"]))

# Obtener un proyecto específico por ID (sin restricción de usuario aún)
@project.get("/api/projects/{id}", response_model=Project)
async def get_project(id: str):
    project = await get_project_by_id(id)
    if project:
        return project
    raise HTTPException(404, f"Proyecto con id {id} no encontrado")

# Crear un nuevo proyecto, asociándolo al usuario autenticado
@project.post("/api/projects", response_model=Project)
async def create_new_project(project: Project, user: dict = Depends(get_current_user)):
    project_data = project.dict()
    project_data["user_id"] = str(user["_id"])
    project_data["user_email"] = user["email"]
    return await create_project(project_data)

# Actualizar un proyecto (sin validar aún si pertenece al usuario)
@project.put("/api/projects/{id}", response_model=Project)
async def update_existing_project(id: str, project: Project):
    return await update_project(id, project.dict())

# Eliminar un proyecto (sin validar aún si pertenece al usuario)
@project.delete("/api/projects/{id}")
async def remove_project(id: str):
    deleted = await delete_project(id)
    if deleted:
        return {"message": "Proyecto eliminado"}
    raise HTTPException(404, f"Proyecto con id {id} no encontrado")

# Resumen de proyectos con progreso (ya filtrado por usuario internamente)
@project.get("/api/projects/summary")
async def list_projects_with_summary(user: dict = Depends(get_current_user)):
    return await get_projects_with_progress(user_id=str(user["_id"]))
