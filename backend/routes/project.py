from fastapi import APIRouter, HTTPException, Request, Depends
from config.database import (
    get_all_projects,
    get_project_by_id,
    create_project,
    update_project,
    delete_project,
    get_projects_with_progress,
)
from models.models import Project
from routes.auth import get_current_user
from bson import ObjectId

project = APIRouter()

# ===================== FUNCIÓN AUXILIAR DE PERMISOS =====================


def get_project_permission(project: dict, user_email: str) -> str:
    if project.get("user_email") == user_email:
        return "admin"
    for collaborator in project.get("collaborators", []):
        if collaborator.get("email") == user_email:
            return collaborator.get("permission", "read")
    return "none"


# ===================== RUTAS =====================


@project.get("/api/projects/{id}", response_model=Project)
async def get_project(id: str, user: dict = Depends(get_current_user)):
    proyecto = await get_project_by_id(id)
    if not proyecto:
        raise HTTPException(404, f"Proyecto con id {id} no encontrado")

    permission = get_project_permission(proyecto, user["email"])
    if permission == "none":
        raise HTTPException(403, "No tienes acceso a este proyecto")

    return proyecto


@project.put("/api/projects/{id}", response_model=Project)
async def put_project(
    id: str, updated_data: Project, user: dict = Depends(get_current_user)
):
    existing_project = await get_project_by_id(id)
    if not existing_project:
        raise HTTPException(404, f"Proyecto con id {id} no encontrado")

    permission = get_project_permission(existing_project, user["email"])
    if permission not in ["write", "admin"]:
        raise HTTPException(403, "No tienes permiso para editar este proyecto")

    result = await update_project(id, updated_data)
    if result:
        return result
    raise HTTPException(400, "No se pudo actualizar el proyecto")


@project.delete("/api/projects/{id}")
async def remove_project(id: str, user: dict = Depends(get_current_user)):
    existing_project = await get_project_by_id(id)
    if not existing_project:
        raise HTTPException(404, f"Proyecto con id {id} no encontrado")

    permission = get_project_permission(existing_project, user["email"])
    if permission != "admin":
        raise HTTPException(403, "Solo un administrador puede eliminar el proyecto")

    deleted = await delete_project(id)
    if deleted:
        return {"message": "Proyecto eliminado correctamente"}
    raise HTTPException(400, "No se pudo eliminar el proyecto")


@project.get("/api/projects")
async def get_projects(request: Request, user: dict = Depends(get_current_user)):
    params = request.query_params

    filters = {
        "name": params.get("name"),
        "description": params.get("description"),
        "user_id": str(user["_id"]),
        "user_email": user["email"],
    }

    return await get_all_projects(filters)


@project.post("/api/projects", response_model=Project)
async def save_project(project: Project, user: dict = Depends(get_current_user)):
    project_data = project.dict()
    project_data["user_id"] = str(user["_id"])
    project_data["user_email"] = user["email"]

    if "collaborators" not in project_data or project_data["collaborators"] is None:
        project_data["collaborators"] = []

    nuevo_proyecto = await create_project(project_data)
    if nuevo_proyecto:
        return nuevo_proyecto
    raise HTTPException(400, "Algo salió mal al crear el proyecto")
