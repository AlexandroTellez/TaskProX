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

MAX_FILES = 2
MAX_TOTAL_SIZE = 15 * 1024 * 1024  # 15 MB en total
MAX_FILE_SIZE = 7.5 * 1024 * 1024  # 7.5 MB por archivo


# ===================== CONVERSIÓN DE ARCHIVOS =====================
def encode_files_to_base64(files: List[UploadFile]) -> List[dict]:
    base64_files = []
    total_size = 0
    ALLOWED_TYPES = [
        # Documentos comunes
        "application/pdf",  # PDF
        "application/msword",  # Word (antiguo .doc)
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # Word (.docx)
        "application/vnd.ms-powerpoint",  # PowerPoint (.ppt)
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",  # PowerPoint (.pptx)
        "application/vnd.ms-excel",  # Excel (.xls)
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # Excel (.xlsx)
        # Archivos comprimidos
        "application/zip",  # ZIP
        "application/x-zip-compressed",  # ZIP comprimido
        "application/x-rar-compressed",  # RAR
        "application/x-7z-compressed",  # 7Z
        "application/x-gzip",  # GZIP
        "application/x-bzip2",  # BZIP2
        # Imágenes estándar
        "image/jpeg",  # JPG/JPEG
        "image/png",  # PNG
        "image/gif",  # GIF
        "image/webp",  # WebP
        "image/tiff",  # TIFF
        "image/bmp",  # BMP
        # Imágenes vectoriales
        "image/svg+xml",  # SVG (correcto)
        "image/svg",  # SVG (algunos navegadores lo usan sin +xml)
        "image/svgz",  # SVGZ (comprimido)
        # Íconos
        "image/x-icon",  # ICO
        "image/vnd.microsoft.icon",  # ICO (alternativo)
        # Imágenes modernas para móviles
        "image/heic",  # HEIC (iOS, iPhone)
        "image/heif",  # HEIF (High Efficiency Image File Format)
        "image/jfif",  # JPEG File Interchange Format
        # Formatos de imágenes portables
        "image/x-portable-anymap",  # PNM
        "image/x-portable-bitmap",  # PBM
        "image/x-portable-graymap",  # PGM
        "image/x-portable-pixmap",  # PPM
        # Formatos de imágenes X (X11)
        "image/x-xbitmap",  # XBM
        "image/x-xpixmap",  # XPM
    ]

    # Validar cantidad de archivos
    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Máximo {MAX_FILES} archivos permitidos.")
    # Validar tamaño total de archivos
    for file in files:
        print(f"[VALIDACIÓN] Procesando archivo: {file.filename} ({file.content_type})")

        file.file.seek(
            0
        )  # Asegurarse de que el cursor del archivo esté al principio y reinicia el puntero por seguridad
        contents = file.file.read()
        if not contents:
            raise HTTPException(400, f"Archivo {file.filename} está vacío.")

        file_size = len(contents)
        print(f"[VALIDACIÓN] Tamaño del archivo: {file_size} bytes")
        total_size += file_size

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                413,
                f"Archivo {file.filename} excede los {int(MAX_FILE_SIZE/1024/1024)}MB permitidos.",
            )
        if total_size > MAX_TOTAL_SIZE:
            raise HTTPException(413, "El total combinado de archivos excede los 15MB.")
        if file.content_type not in ALLOWED_TYPES and not file.content_type.startswith(
            "image/"
        ):
            raise HTTPException(415, f"Tipo no permitido: {file.content_type}")

        encoded = base64.b64encode(contents).decode("utf-8")
        file.file.close()

        base64_files.append(
            {
                "name": file.filename,
                "type": file.content_type,
                "data": f"data:{file.content_type};base64,{encoded}",
            }
        )

    print(f"[VALIDACIÓN FINAL] Tamaño total combinado de archivos: {total_size} bytes")
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

    # Ahora pasamos email e id del usuario para que calcule el permiso heredado del proyecto
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


# ===================== PUT CON JSON =====================
@task.put("/api/tasks/{id}")
async def put_task_json(
    id: str,
    task_data: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    print(f"[PUT /tasks/{id}] Usuario: {user['email']}")
    print(f"[PUT /tasks/{id}] Datos recibidos: {task_data.keys()}")

    # Verificar existencia de tarea
    existing_task = await get_one_task_id(
        id, user_email=user["email"], user_id=user["id"]
    )
    if not existing_task:
        raise HTTPException(404, f"Tarea con id {id} no encontrada")

    task_data["user_email"] = user["email"]
    task_data["user_id"] = user["id"]

    # Validación de recurso base64
    if "recurso" in task_data:
        recurso = task_data["recurso"]
        if not isinstance(recurso, list):
            raise HTTPException(400, "El campo 'recurso' debe ser una lista")

        total_size = 0
        for item in recurso:
            if not isinstance(item, dict) or "data" not in item or "name" not in item:
                raise HTTPException(
                    400, "Formato inválido en alguno de los archivos adjuntos"
                )

            base64_data = item["data"].split(",")[-1]
            try:
                size = len(base64.b64decode(base64_data))
            except Exception:
                raise HTTPException(400, "Archivo base64 inválido o malformado")

            total_size += size
            if size > MAX_FILE_SIZE:
                raise HTTPException(
                    413,
                    f"Uno de los archivos excede los {int(MAX_FILE_SIZE / 1024 / 1024)}MB",
                )
            if total_size > MAX_TOTAL_SIZE:
                raise HTTPException(
                    413, "El total combinado de archivos supera los 15MB permitidos"
                )

    updated = await update_task(id, task_data)
    print(f"[PUT /tasks/{id}] Tarea actualizada: {updated}")

    if not updated:
        raise HTTPException(400, "No se pudo actualizar la tarea")

    return updated


# ===================== POST UPDATE CON JSON =====================
@task.post("/api/tasks/{id}/update")
async def post_update_task_json(
    id: str,
    task_data: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    print(f"[POST /tasks/{id}/update] Usuario: {user['email']}")
    print(f"[POST /tasks/{id}/update] Datos recibidos: {task_data.keys()}")

    task_data["user_email"] = user["email"]
    task_data["user_id"] = user["id"]

    # Validación de recurso base64
    if "recurso" in task_data:
        recurso = task_data["recurso"]
        if not isinstance(recurso, list):
            raise HTTPException(400, "El campo 'recurso' debe ser una lista")

        total_size = 0
        for item in recurso:
            if not isinstance(item, dict) or "data" not in item or "name" not in item:
                raise HTTPException(
                    400, "Formato inválido en alguno de los archivos adjuntos"
                )

            # Validar tamaño aproximado del base64
            base64_data = item["data"].split(",")[-1]
            try:
                size = len(base64.b64decode(base64_data))
            except Exception:
                raise HTTPException(400, "Archivo base64 inválido o malformado")

            total_size += size
            if size > MAX_FILE_SIZE:
                raise HTTPException(
                    413,
                    f"Uno de los archivos excede los {int(MAX_FILE_SIZE / 1024 / 1024)}MB",
                )
            if total_size > MAX_TOTAL_SIZE:
                raise HTTPException(
                    413, "El total combinado de archivos supera los 15MB permitidos"
                )

    updated = await update_task(id, task_data)
    print(f"[POST /tasks/{id}/update] Tarea actualizada: {updated}")

    if not updated:
        raise HTTPException(400, "No se pudo actualizar la tarea")

    return updated


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


# ===================== POST (JSON con recurso base64) =====================
@task.post("/api/tasks", tags=["tasks"], summary="Crear tarea con JSON (base64)")
async def save_task_json(
    task_data: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    print(f"[POST /tasks] Usuario: {user['email']}")
    print(f"[POST /tasks] Datos recibidos: {task_data.keys()}")

    # Enriquecer con datos del usuario autenticado
    task_data.update(
        {
            "user_id": user["id"],
            "user_email": user["email"],
            "creator": user["email"],
            "creator_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
            "collaborators": task_data.get("collaborators", []),
        }
    )

    # Validación del campo `recurso` (archivos en base64)
    if "recurso" in task_data:
        recurso = task_data["recurso"]
        if not isinstance(recurso, list):
            raise HTTPException(400, "El campo 'recurso' debe ser una lista")

        total_size = 0
        for item in recurso:
            if not isinstance(item, dict) or "data" not in item or "name" not in item:
                raise HTTPException(
                    400, "Formato inválido en alguno de los archivos adjuntos"
                )

            # Extraer base64 limpio y verificar tamaño
            base64_data = item["data"].split(",")[-1]
            try:
                size = len(base64.b64decode(base64_data))
            except Exception:
                raise HTTPException(400, "Archivo base64 inválido o malformado")

            total_size += size
            if size > MAX_FILE_SIZE:
                raise HTTPException(
                    413,
                    f"Uno de los archivos excede los {int(MAX_FILE_SIZE / 1024 / 1024)}MB",
                )
            if total_size > MAX_TOTAL_SIZE:
                raise HTTPException(
                    413, "El total combinado de archivos supera los 15MB permitidos"
                )

    print(f"[POST /tasks] Validación de archivos completada.")
    nueva_tarea = await create_task(task_data)
    print(f"[POST /tasks] Tarea creada: {nueva_tarea}")

    if not nueva_tarea:
        raise HTTPException(400, "Algo salió mal al crear la tarea")

    return nueva_tarea


# ===================== PATCH STATUS =====================
@task.patch("/api/tasks/{id}/status")
async def patch_task_status(
    id: str,
    status_data: dict = Body(...),
    user: dict = Depends(get_current_user),
):
    print(f"[PATCH /tasks/{id}/status] Usuario: {user['email']} - Datos: {status_data}")

    # Añadido user_email y user_id
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
