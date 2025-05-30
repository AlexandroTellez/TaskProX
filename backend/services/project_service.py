from bson import ObjectId
from bson.errors import InvalidId
from config.database import (
    project_collection,
    collection as task_collection,  # Colección de tareas
)


# ================== Serializador para proyectos ==================
def serialize_project(document):
    """
    Convierte ObjectId a string y garantiza estructura limpia del proyecto.
    """
    if not document:
        return None

    # _id → id
    if "_id" in document and isinstance(document["_id"], ObjectId):
        document["id"] = str(document["_id"])
        document.pop("_id", None)

    if "user_id" in document and isinstance(document["user_id"], ObjectId):
        document["user_id"] = str(document["user_id"])

    if "collaborators" in document and isinstance(document["collaborators"], list):
        for colab in document["collaborators"]:
            for k, v in colab.items():
                if isinstance(v, ObjectId):
                    colab[k] = str(v)

    return document


# ================== Obtener todos los proyectos accesibles al usuario ==================
async def get_all_projects(filters: dict = None):
    filters = filters or {}
    query = {}

    user_id = filters.get("user_id")
    user_email = filters.get("user_email")

    if not user_id or not user_email:
        raise ValueError("Faltan datos del usuario (user_id o user_email)")

    base_or = [
        {"user_id": user_id},
        {"collaborators": {"$elemMatch": {"email": user_email}}},
    ]

    # ================== Obtener projectId de tareas individuales ==================
    task_project_ids = set()
    task_cursor = task_collection.find({"collaborators.email": user_email})
    async for task in task_cursor:
        if "projectId" in task:
            try:
                # Convertir a ObjectId aunque sea string
                project_oid = ObjectId(task["projectId"])
                task_project_ids.add(project_oid)
            except Exception as e:
                print(f"⚠️ ProjectId inválido en tarea: {task.get('projectId')} → {e}")
                continue

    if task_project_ids:
        base_or.append({"_id": {"$in": list(task_project_ids)}})

    query["$or"] = base_or

    # ================== Filtros opcionales ==================
    if filters.get("name"):
        query["name"] = {"$regex": filters["name"], "$options": "i"}
    if filters.get("description"):
        query["description"] = {"$regex": filters["description"], "$options": "i"}

    print(f"[get_all_projects] Consulta: {query}")
    print(f"[get_all_projects] Proyectos desde tareas individuales: {task_project_ids}")

    # ================== Obtener proyectos ==================
    projects = []
    cursor = project_collection.find(query)
    async for document in cursor:
        project = serialize_project(document)

        # Calcular permiso efectivo
        if project.get("user_id") == user_id:
            project["effective_permission"] = "admin"
        else:
            permiso = "read"
            for col in project.get("collaborators", []):
                if col.get("email") == user_email:
                    permiso = col.get("permission", "read")
                    break
            project["effective_permission"] = permiso

        projects.append(project)

    print(f"[get_all_projects] Total proyectos: {len(projects)}")
    return projects


# ================== Obtener un proyecto por ID ==================
async def get_project_by_id(id: str):
    if not id or not isinstance(id, str) or id.lower() == "none":
        raise ValueError(f"ID de proyecto inválido: {id}")

    try:
        obj_id = ObjectId(id)
    except (InvalidId, TypeError):
        raise ValueError(f"ID de proyecto inválido: {id}")

    document = await project_collection.find_one({"_id": obj_id})
    return serialize_project(document)


# ================== Crear un nuevo proyecto ==================
async def create_project(data: dict):
    data.setdefault("collaborators", [])
    result = await project_collection.insert_one(data)
    created = await project_collection.find_one({"_id": result.inserted_id})
    return serialize_project(created)


# ================== Actualizar proyecto ==================
async def update_project(id: str, data: dict):
    if not id or not isinstance(id, str) or id.lower() == "none":
        raise ValueError(f"ID de proyecto inválido: {id}")
    try:
        obj_id = ObjectId(id)
    except (InvalidId, TypeError):
        raise ValueError(f"ID de proyecto inválido: {id}")

    await project_collection.update_one({"_id": obj_id}, {"$set": data})
    updated = await project_collection.find_one({"_id": obj_id})
    return serialize_project(updated)


# ================== Eliminar proyecto y sus tareas asociadas ==================
async def delete_project(id: str):
    if not id or not isinstance(id, str) or id.lower() == "none":
        raise ValueError(f"ID de proyecto inválido: {id}")
    try:
        project_oid = ObjectId(id)
    except (InvalidId, TypeError):
        raise ValueError(f"ID de proyecto inválido: {id}")

    await task_collection.delete_many({"projectId": project_oid})
    result = await project_collection.delete_one({"_id": project_oid})
    return result.deleted_count == 1
