from fastapi import APIRouter, HTTPException
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

project = APIRouter()

@project.get("/api/projects")
async def list_projects():
    return await get_all_projects()

@project.get("/api/projects/{id}", response_model=Project)
async def get_project(id: str):
    project = await get_project_by_id(id)
    if project:
        return project
    raise HTTPException(404, f"Proyecto con id {id} no encontrado")

@project.post("/api/projects", response_model=Project)
async def create_new_project(project: Project):
    return await create_project(project.dict())

@project.put("/api/projects/{id}", response_model=Project)
async def update_existing_project(id: str, project: Project):
    return await update_project(id, project.dict())

@project.delete("/api/projects/{id}")
async def remove_project(id: str):
    deleted = await delete_project(id)
    if deleted:
        return {"message": "Proyecto eliminado"}
    raise HTTPException(404, f"Proyecto con id {id} no encontrado")

@project.get("/api/projects/summary")
async def list_projects_with_summary():
    # Devuelve todos los proyectos con su estado calculado
    return await get_projects_with_progress()
