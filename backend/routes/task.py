from fastapi import (
    APIRouter,
    HTTPException,
    Request,
    Depends,
    UploadFile,
    File,
    Form,
    Body,
)
from services.task_service import (
    get_all_tasks,
    create_task,
    get_one_task_id,
    update_task,
    delete_task,
    update_task_status,
)
from models.models import Task
from routes.auth import get_current_user
import json
import base64
from typing import List


task = APIRouter()

MAX_FILES = 3
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ===================== CONVERSIÓN DE ARCHIVOS A BASE64 =====================
def encode_files_to_base64(files: List[UploadFile]) -> List[dict]:
    base64_files = []

    ALLOWED_TYPES = [
        "application/pdf",
        "application/msword",  # .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
        "application/vnd.ms-excel",  # .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # .xlsx
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        # Se aceptarán tipos que empiecen con image/ incluso si no están listados explícitamente (como RAW)
    ]

    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Máximo {MAX_FILES} archivos permitidos.")

    for file in files:
        contents = file.file.read()

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(413, f"El archivo {file.filename} excede los 5MB")

        if file.content_type not in ALLOWED_TYPES and not file.content_type.startswith(
            "image/"
        ):
            raise HTTPException(
                415,
                f"Tipo de archivo no permitido: {file.content_type}. Solo se permiten documentos (PDF, Word, Excel) e imágenes.",
            )

        encoded = base64.b64encode(contents).decode("utf-8")
        base64_files.append(
            {
                "name": file.filename,
                "type": file.content_type,
                "data": f"data:{file.content_type};base64,{encoded}",
            }
        )

    return base64_files


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
async def put_task(
    id: str,
    task: str = Form(...),
    files: List[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    existing_task = await get_one_task_id(id)
    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(existing_task, user["email"])
    if permission not in ["write", "admin"]:
        raise HTTPException(403, "No tienes permiso para editar esta tarea")

    task_data = json.loads(task)

    if files:
        task_data["recurso"] = encode_files_to_base64(files)

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
        "has_recurso": params.get("hasRecurso"),
    }

    return await get_all_tasks(filters)


# ===================== RUTA POST =====================
@task.post("/api/tasks", response_model=Task)
async def save_task(
    task: str = Form(...),
    files: List[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    task_data = json.loads(task)
    task_data["user_id"] = str(user["_id"])
    task_data["user_email"] = user["email"]
    task_data["creator"] = user["email"]
    task_data["creator_name"] = (
        f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
    )

    if "collaborators" not in task_data or task_data["collaborators"] is None:
        task_data["collaborators"] = []

    if files:
        task_data["recurso"] = encode_files_to_base64(files)

    nueva_tarea = await create_task(task_data)
    if nueva_tarea:
        return nueva_tarea
    raise HTTPException(400, "Algo salió mal al crear la tarea")

# ===================== NUEVA RUTA PATCH PARA ACTUALIZAR SOLO STATUS =====================
@task.patch("/api/tasks/{id}/status", response_model=Task)
async def patch_task_status(
    id: str,
    status_data: dict = Body(...),  # espera {"status": "nuevo_estado"}
    user: dict = Depends(get_current_user),
):
    existing_task = await get_one_task_id(id)
    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(existing_task, user["email"])
    if permission not in ["write", "admin"]:
        raise HTTPException(403, "No tienes permiso para cambiar el estado")

    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(400, "Se requiere el nuevo estado ('status')")

    updated = await update_task_status(id, new_status)
    if updated:
        return updated

    raise HTTPException(400, "No se pudo actualizar el estado de la tarea")