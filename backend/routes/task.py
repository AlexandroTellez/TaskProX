from fastapi import APIRouter, HTTPException, Request, Depends
from services.task_service import (
    get_all_tasks,
    create_task,
    get_one_task_id,
    update_task,
    delete_task,
)
from models.models import Task, UpdateTask
from routes.auth import get_current_user
from bson import ObjectId
from datetime import datetime, timezone

task = APIRouter()


# ===================== FUNCIÓN AUXILIAR DE PERMISOS =====================
def get_permission(task: dict, user_email: str) -> str:
    if task.get("creator") == user_email:
        return "admin"
    if "effective_permission" in task:
        return task["effective_permission"]
    for collaborator in task.get("collaborators", []):
        if collaborator.get("email") == user_email:
            return collaborator.get("permission", "read")
    return "none"


# ===================== RUTA GET POR ID =====================
@task.get("/api/tasks/{id}", response_model=Task)
async def get_task(id: str, user: dict = Depends(get_current_user)):
    tarea = await get_one_task_id(id)
    if not tarea:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(tarea, user["email"])
    if permission == "none":
        raise HTTPException(403, "No tienes acceso a esta tarea")

    tarea["effective_permission"] = permission

    if "_id" in tarea and "id" not in tarea:
        tarea["id"] = str(tarea["_id"])

    return tarea


# ===================== RUTA PUT =====================
@task.put("/api/tasks/{id}", response_model=Task)
async def put_task(id: str, task: UpdateTask, user: dict = Depends(get_current_user)):
    existing_task = await get_one_task_id(id)
    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(existing_task, user["email"])
    if permission not in ["write", "admin"]:
        raise HTTPException(403, "No tienes permiso para editar esta tarea")

    task_data = task.model_dump(exclude_unset=True)

    try:
        for field in ["startDate", "deadline"]:
            value = task_data.get(field)
            if isinstance(value, str):
                task_data[field] = datetime.fromisoformat(value).replace(
                    tzinfo=timezone.utc
                )
            elif isinstance(value, datetime):
                task_data[field] = value.astimezone(timezone.utc)
    except Exception as e:
        raise HTTPException(400, f"Error en formato de fechas: {e}")

    updated = await update_task(id, task_data)
    if updated:
        return updated
    raise HTTPException(400, "No se pudo actualizar la tarea")


# ===================== RUTA DELETE =====================
@task.delete("/api/tasks/{id}")
async def remove_task(id: str, user: dict = Depends(get_current_user)):
    existing_task = await get_one_task_id(id)
    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(existing_task, user["email"])
    if permission != "admin":
        raise HTTPException(403, "Solo un administrador puede eliminar esta tarea")

    deleted = await delete_task(id)
    if deleted:
        return {"message": "Tarea eliminada correctamente"}
    raise HTTPException(400, "No se pudo eliminar la tarea")


# ===================== RUTA GET CON FILTROS =====================
@task.get("/api/tasks")
async def get_tasks(request: Request, user: dict = Depends(get_current_user)):
    params = request.query_params

    filters = {
        "project_id": params.get("projectId"),
        "title": params.get("title"),
        "creator": params.get("creator"),
        "status": params.get("status"),
        "startDate": params.get("startDate"),
        "deadline": params.get("deadline"),
        "user_id": str(user["_id"]),
        "user_email": user["email"],
    }

    return await get_all_tasks(filters)


# ===================== RUTA POST =====================
@task.post("/api/tasks", response_model=Task)
async def save_task(task: Task, user: dict = Depends(get_current_user)):
    task_data = task.model_dump()
    task_data["user_id"] = str(user["_id"])
    task_data["user_email"] = user["email"]
    task_data["creator"] = user["email"]
    task_data["creator_name"] = (
        f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
    )

    if "collaborators" not in task_data or task_data["collaborators"] is None:
        task_data["collaborators"] = []

    try:
        for field in ["startDate", "deadline"]:
            value = task_data.get(field)
            if isinstance(value, str):
                task_data[field] = datetime.fromisoformat(value).replace(
                    tzinfo=timezone.utc
                )
            elif isinstance(value, datetime):
                task_data[field] = value.astimezone(timezone.utc)
    except Exception as e:
        raise HTTPException(400, f"Error en formato de fechas: {e}")

    nueva_tarea = await create_task(task_data)
    if nueva_tarea:
        return nueva_tarea
    raise HTTPException(400, "Algo salió mal al crear la tarea")
