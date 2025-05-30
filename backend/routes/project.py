from fastapi import APIRouter, HTTPException, Request, Depends
from services.project_service import (
    get_all_projects,
    get_project_by_id,
    create_project,
    update_project,
    delete_project,
)
from services.task_service import delete_tasks_by_project
from routes.auth import get_current_user
from bson import ObjectId

project = APIRouter()


# ===================== FUNCIÓN AUXILIAR DE PERMISOS =====================
def get_project_permission(project: dict, user_email: str) -> str:
    """
    Devuelve el nivel de permiso del usuario respecto a un proyecto:
    - admin: si es el creador o si un colaborador tiene permiso admin
    - write: si es colaborador con permiso writer
    - read: si es colaborador con permiso read
    - none: sin acceso
    """
    if project.get("user_email") == user_email:
        return "admin"

    # Buscar en la lista de colaboradores por email
    for collaborator in project.get("collaborators", []):
        if collaborator.get("email") == user_email:
            return collaborator.get("permission", "read")  # por defecto read

    return "none"


# ===================== FUNCIÓN AUXILIAR PARA CONVERTIR _id A id =====================
def convert_id_to_str(doc: dict):
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["id"] = str(doc["_id"])  # Nueva clave 'id'
        doc.pop("_id", None)  # Eliminamos '_id' para coherencia con el frontend
    return doc


# ===================== RUTA: Obtener proyecto por ID =====================
@project.get("/api/projects/{id}")
async def get_project(id: str, user: dict = Depends(get_current_user)):
    print(f"[GET /projects/{id}] Usuario: {user['email']}")
    proyecto = await get_project_by_id(id)
    print(f"[GET /projects/{id}] Proyecto bruto obtenido: {proyecto}")

    if not proyecto:
        raise HTTPException(404, f"Proyecto con id {id} no encontrado")

    permission = get_project_permission(proyecto, user["email"])
    print(f"[GET /projects/{id}] Permiso del usuario: {permission}")

    if permission == "none":
        raise HTTPException(403, "No tienes acceso a este proyecto")

    result = convert_id_to_str(proyecto)
    print(f"[GET /projects/{id}] Proyecto final a devolver: {result}")
    return result


# ===================== RUTA: Actualizar proyecto =====================
@project.put("/api/projects/{id}")
async def put_project(
    id: str, updated_data: dict, user: dict = Depends(get_current_user)
):
    print(f"[PUT /projects/{id}] Usuario: {user['email']}")

    if not id or id == "null":
        raise HTTPException(400, "ID de proyecto inválido (null)")

    existing_project = await get_project_by_id(id)
    print(f"[PUT /projects/{id}] Proyecto original: {existing_project}")

    if not existing_project:
        raise HTTPException(404, f"Proyecto con id {id} no encontrado")

    permission = get_project_permission(existing_project, user["email"])
    print(f"[PUT /projects/{id}] Permiso del usuario: {permission}")

    if permission not in ["write", "admin"]:
        raise HTTPException(403, "No tienes permiso para editar este proyecto")

    result = await update_project(id, updated_data)
    print(f"[PUT /projects/{id}] Proyecto actualizado: {result}")

    if result:
        return convert_id_to_str(result)

    raise HTTPException(400, "No se pudo actualizar el proyecto")


# ===================== RUTA: Eliminar proyecto =====================
@project.delete("/api/projects/{id}")
async def remove_project(id: str, user: dict = Depends(get_current_user)):
    print(f"[DELETE /projects/{id}] Usuario: {user['email']}")

    if not id or id == "null":
        raise HTTPException(400, "ID de proyecto inválido (null)")

    existing_project = await get_project_by_id(id)
    print(f"[DELETE /projects/{id}] Proyecto encontrado: {existing_project}")

    if not existing_project:
        raise HTTPException(404, f"Proyecto con id {id} no encontrado")

    permission = get_project_permission(existing_project, user["email"])
    print(f"[DELETE /projects/{id}] Permiso del usuario: {permission}")

    if permission != "admin":
        raise HTTPException(403, "Solo un administrador puede eliminar el proyecto")

    deleted = await delete_project(id)
    print(f"[DELETE /projects/{id}] Proyecto eliminado: {deleted}")

    if deleted:
        await delete_tasks_by_project(id)
        return {"message": "Proyecto y tareas asociadas eliminados correctamente"}

    raise HTTPException(400, "No se pudo eliminar el proyecto")


# ===================== RUTA: Obtener todos los proyectos del usuario =====================
@project.get("/api/projects")
async def get_projects(request: Request, user: dict = Depends(get_current_user)):
    params = request.query_params
    print(f"[GET /projects] Usuario: {user['email']} - Parámetros: {params}")

    filters = {
        "name": params.get("name"),
        "description": params.get("description"),
        "user_id": user["id"],
        "user_email": user["email"],
    }

    proyectos = await get_all_projects(filters)
    print(f"[GET /projects] Proyectos crudos: {proyectos}")

    final = [convert_id_to_str(p) for p in proyectos]
    print(f"[GET /projects] Proyectos convertidos: {final}")

    return final


# ===================== RUTA: Crear nuevo proyecto =====================
@project.post("/api/projects")
async def save_project(project_data: dict, user: dict = Depends(get_current_user)):
    project_data["user_id"] = user["id"]
    project_data["user_email"] = user["email"]

    if "collaborators" not in project_data or project_data["collaborators"] is None:
        project_data["collaborators"] = []

    print(f"[POST /projects] Datos a crear: {project_data}")
    nuevo_proyecto = await create_project(project_data)
    print(f"[POST /projects] Proyecto creado: {nuevo_proyecto}")

    if nuevo_proyecto:
        return convert_id_to_str(nuevo_proyecto)

    raise HTTPException(400, "Algo salió mal al crear el proyecto")
