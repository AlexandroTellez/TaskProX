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
    serialize_task,
)
from routes.auth import get_current_user
from config.database import collection
from bson import ObjectId
import json, base64
from typing import List

task = APIRouter()

MAX_FILES = 3
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# ===================== CONVERSIÓN DE ARCHIVOS =====================
def encode_files_to_base64(files: List[UploadFile]) -> List[dict]:
    base64_files = []
    ALLOWED_TYPES = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
    ]

    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Máximo {MAX_FILES} archivos permitidos.")

    for file in files:
        contents = file.file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(413, f"Archivo {file.filename} excede los 5MB")
        if file.content_type not in ALLOWED_TYPES and not file.content_type.startswith(
            "image/"
        ):
            raise HTTPException(415, f"Tipo no permitido: {file.content_type}")

        encoded = base64.b64encode(contents).decode("utf-8")
        base64_files.append(
            {
                "name": file.filename,
                "type": file.content_type,
                "data": f"data:{file.content_type};base64,{encoded}",
            }
        )
    return base64_files


# ===================== PERMISOS =====================
def get_permission(task: dict, user_email: str) -> str:
    if task.get("creator") == user_email:
        return "admin"
    if "effective_permission" in task:
        return task["effective_permission"]
    for col in task.get("collaborators", []):
        if col.get("email") == user_email:
            return col.get("permission", "read")
    return "none"


# ===================== GET POR ID =====================
@task.get("/api/tasks/{id}")
async def get_task(id: str, user: dict = Depends(get_current_user)):
    print(f"[GET /tasks/{id}] Usuario: {user['email']}")

    # Validar ID inválido explícitamente antes de consultar la base de datos
    if not id or id.lower() == "undefined":
        print(f"[GET /tasks/{id}] ID inválido recibido: {id}")
        raise HTTPException(status_code=400, detail="ID de tarea inválido")

    # ✅ MODIFICADO: ahora pasamos email e id del usuario para que calcule el permiso heredado del proyecto
    tarea = await get_one_task_id(id, user_email=user["email"], user_id=user["id"])
    print(f"[GET /tasks/{id}] Tarea encontrada: {tarea}")

    if not tarea:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(tarea, user["email"])
    print(f"[GET /tasks/{id}] Permiso del usuario: {permission}")

    if permission == "none":
        raise HTTPException(403, "No tienes acceso a esta tarea")

    tarea["effective_permission"] = permission
    return tarea  # Ya está serializada


# ===================== PUT =====================
@task.put("/api/tasks/{id}")
async def put_task(
    id: str,
    task: str = Form(...),
    files: List[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    print(f"[PUT /tasks/{id}] Usuario: {user['email']}")

    # Añadido user_email y user_id
    existing_task = await get_one_task_id(
        id, user_email=user["email"], user_id=user["id"]
    )
    print(f"[PUT /tasks/{id}] Tarea original: {existing_task}")

    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    task_data = json.loads(task)
    task_data["user_email"] = user["email"]
    task_data["user_id"] = user["id"]

    if files:
        task_data["recurso"] = encode_files_to_base64(files)

    updated = await update_task(id, task_data)
    print(f"[PUT /tasks/{id}] Tarea actualizada: {updated}")
    return updated if updated else HTTPException(400, "No se pudo actualizar la tarea")


# ===================== DELETE =====================
@task.delete("/api/tasks/{id}")
async def remove_task(id: str, user: dict = Depends(get_current_user)):
    print(f"[DELETE /tasks/{id}] Usuario: {user['email']}")

    try:
        deleted = await delete_task(id, user_email=user["email"], user_id=user["id"])
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(400, f"No se pudo eliminar la tarea: {e}")

    print(f"[DELETE /tasks/{id}] Eliminada: {deleted}")
    return {"message": "Tarea eliminada correctamente"}


# ===================== GET GENERAL =====================
@task.get("/api/tasks")
async def get_tasks(request: Request, user: dict = Depends(get_current_user)):
    params = request.query_params
    print(f"[GET /tasks] Usuario: {user['email']} - Parámetros: {params}")

    filters = {
        "project_id": params.get("projectId"),
        "title": params.get("title"),
        "creator": params.get("creator"),
        "status": params.get("status"),
        "startDate": params.get("startDate"),
        "deadline": params.get("deadline"),
        "user_id": user["id"],
        "user_email": user["email"],
        "has_recurso": params.get("hasRecurso"),
    }

    tareas = await get_all_tasks(filters)
    print(f"[GET /tasks] Tareas encontradas: {len(tareas)}")
    return tareas  # Ya serializadas


# ===================== POST =====================
@task.post("/api/tasks")
async def save_task(
    task: str = Form(...),
    files: List[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    task_data = json.loads(task)
    task_data.update(
        {
            "user_id": user["id"],
            "user_email": user["email"],
            "creator": user["email"],
            "creator_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
            "collaborators": task_data.get("collaborators", []),
        }
    )

    if files:
        task_data["recurso"] = encode_files_to_base64(files)

    print(f"[POST /tasks] Datos para nueva tarea: {task_data}")
    nueva_tarea = await create_task(task_data)
    print(f"[POST /tasks] Tarea creada: {nueva_tarea}")
    return (
        nueva_tarea
        if nueva_tarea
        else HTTPException(400, "Algo salió mal al crear la tarea")
    )


# ===================== PATCH STATUS =====================
@task.patch("/api/tasks/{id}/status")
async def patch_task_status(
    id: str,
    status_data: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    print(f"[PATCH /tasks/{id}/status] Usuario: {user['email']} - Datos: {status_data}")

    # ✅ Añadido user_email y user_id
    existing_task = await get_one_task_id(
        id, user_email=user["email"], user_id=user["id"]
    )
    print(f"[PATCH /tasks/{id}/status] Tarea original: {existing_task}")

    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    permission = get_permission(existing_task, user["email"])
    print(f"[PATCH /tasks/{id}/status] Permiso del usuario: {permission}")

    if permission not in ["write", "admin"]:
        raise HTTPException(403, "No tienes permiso para cambiar el estado")

    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(400, "Se requiere el nuevo estado ('status')")

    updated = await update_task_status(id, new_status)
    print(f"[PATCH /tasks/{id}/status] Tarea actualizada: {updated}")
    return updated if updated else HTTPException(400, "No se pudo actualizar el estado")


# ===================== TAREAS POR PROYECTO =====================
@task.get("/api/tasks/by-project/{project_id}")
async def get_tasks_by_project(project_id: str, user: dict = Depends(get_current_user)):
    print(f"[GET /tasks/by-project/{project_id}] Usuario: {user['email']}")
    try:
        query = {
            "projectId": ObjectId(project_id),
            "$or": [
                {"creator": user["email"]},
                {"collaborators": {"$elemMatch": {"email": user["email"]}}},
            ],
        }

        tasks = []
        async for doc in collection.find(query):
            print(f"[GET /tasks/by-project/{project_id}] Tarea encontrada: {doc}")
            serialized = serialize_task(doc)  # Convertir ObjectId a str
            tasks.append(serialized)

        print(f"[GET /tasks/by-project/{project_id}] Total tareas: {len(tasks)}")
        return tasks
    except Exception as e:
        print(f"[ERROR] Error en /tasks/by-project: {e}")
        raise HTTPException(status_code=500, detail=str(e))
