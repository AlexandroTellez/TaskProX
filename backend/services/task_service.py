from bson import ObjectId
from datetime import datetime, timedelta
from models.models import Task
from config.database import collection, project_collection
from services.utils import normalize_status


# ================== Obtener tarea por ID ==================
async def get_one_task_id(id: str):
    return await collection.find_one({"_id": ObjectId(id)})


# ================== Obtener todas las tareas según filtros ==================
async def get_all_tasks(filters: dict):
    query = {}
    user_id = filters.get("user_id")
    user_email = filters.get("user_email")
    project_id = filters.get("project_id")

    project_permissions = {}
    project_ids = []

    project_query = {
        "$or": [
            {"user_id": user_id},
            {"collaborators": {"$elemMatch": {"email": user_email}}},
        ]
    }

    cursor = project_collection.find(project_query)
    async for project in cursor:
        pid = project["_id"]
        project_ids.append(pid)
        if project["user_id"] == user_id:
            project_permissions[str(pid)] = "admin"
        else:
            for col in project.get("collaborators", []):
                if col["email"] == user_email:
                    project_permissions[str(pid)] = col["permission"]

    base_conditions = [
        {"creator": user_email},
        {"collaborators": {"$elemMatch": {"email": user_email}}},
        {"projectId": {"$in": project_ids}},
    ]

    if project_id:
        try:
            project_oid = ObjectId(project_id)
            query["$and"] = [{"projectId": project_oid}, {"$or": base_conditions}]
        except Exception as e:
            print(f"[ERROR] ID de proyecto inválido: {project_id} -> {e}")
            query["$or"] = base_conditions
    else:
        query["$or"] = base_conditions

    if filters.get("title"):
        query["title"] = {"$regex": filters["title"], "$options": "i"}
    if filters.get("creator"):
        query["creator_name"] = {"$regex": filters["creator"], "$options": "i"}
    if filters.get("status"):
        query["status"] = normalize_status(filters["status"])
    if filters.get("startDate"):
        try:
            start_date = datetime.fromisoformat(filters["startDate"])
            query["startDate"] = {
                "$gte": start_date,
                "$lt": start_date + timedelta(days=1),
            }
        except Exception as e:
            print(f"[WARN] Error al parsear startDate: {e}")
    if filters.get("deadline"):
        try:
            deadline = datetime.fromisoformat(filters["deadline"])
            query["deadline"] = {
                "$gte": deadline,
                "$lt": deadline + timedelta(days=1),
            }
        except Exception as e:
            print(f"[WARN] Error al parsear deadline: {e}")

    # ================== FILTRO POR RECURSO ==================
    if filters.get("has_recurso") == "yes":
        query["recurso"] = {"$ne": None}
    elif filters.get("has_recurso") == "no":
        query["recurso"] = None

    tasks = []
    cursor = collection.find(query)
    async for document in cursor:
        project_id_str = str(document.get("projectId"))
        permission = None

        if document.get("creator") == user_email:
            permission = "admin"
        elif project_id_str in project_permissions:
            permission = project_permissions[project_id_str]
        else:
            for col in document.get("collaborators", []):
                if col["email"] == user_email:
                    permission = col.get("permission", "read")
                    break

        if not permission:
            continue

        document["effective_permission"] = permission
        if "_id" in document and "id" not in document:
            document["id"] = str(document["_id"])

        tasks.append(Task(**document))

    return tasks


# ================== Crear tarea ==================
async def create_task(task: dict):
    if "projectId" in task and isinstance(task["projectId"], str):
        try:
            task["projectId"] = ObjectId(task["projectId"])
        except:
            raise ValueError("projectId inválido")

    # Normalizar o capitalizar estado
    task["status"] = normalize_status(task.get("status", ""))

    task.setdefault("deadline", None)
    task.setdefault("collaborators", [])

    # Asegurar que 'recurso' sea lista si no se proporciona
    task.setdefault("recurso", [])

    new_task = await collection.insert_one(task)
    created_task = await collection.find_one({"_id": new_task.inserted_id})
    return Task(**created_task)


# ================== Actualizar tarea ==================
async def update_task(id: str, data: dict):
    task_data = data.copy()

    if "projectId" in task_data and isinstance(task_data["projectId"], str):
        try:
            task_data["projectId"] = ObjectId(task_data["projectId"])
        except:
            raise ValueError("projectId inválido")

    if "status" in task_data:
        task_data["status"] = normalize_status(task_data["status"])

    if "deadline" in task_data:
        if isinstance(task_data["deadline"], str):
            try:
                task_data["deadline"] = datetime.strptime(
                    task_data["deadline"], "%Y-%m-%d"
                ).date()
            except ValueError:
                task_data["deadline"] = None

    await collection.update_one({"_id": ObjectId(id)}, {"$set": task_data})
    updated_task = await collection.find_one({"_id": ObjectId(id)})
    return updated_task


# ================== Eliminar tarea ==================
async def delete_task(id: str):
    await collection.delete_one({"_id": ObjectId(id)})
    return True
