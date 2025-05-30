from bson import ObjectId
from datetime import datetime, timedelta
from models.models import Task
from config.database import collection, project_collection
from services.utils import normalize_status
from bson.errors import InvalidId
import json  # añadido para validar colaboradores


# ========== Función auxiliar para convertir ObjectId y preparar el documento ==========
def serialize_task(document):
    if not document:
        print("[serialize_task] Documento vacío o None")
        return None

    if "_id" in document and isinstance(document["_id"], ObjectId):
        document["id"] = str(document["_id"])
        document.pop("_id", None)

    for key in ["projectId", "user_id"]:
        if key in document and isinstance(document[key], ObjectId):
            document[key] = str(document[key])

    if "recurso" in document and isinstance(document["recurso"], list):
        document["recurso"] = [
            str(item) if isinstance(item, ObjectId) else item
            for item in document["recurso"]
        ]

    if "collaborators" in document and isinstance(document["collaborators"], list):
        for colab in document["collaborators"]:
            for k, v in colab.items():
                if isinstance(v, ObjectId):
                    colab[k] = str(v)

    return document


# ================== Obtener una tarea por ID ==================
async def get_one_task_id(id: str, user_email: str, user_id: str):
    print(f"[get_one_task_id] Buscando tarea con ID: {id}")
    try:
        obj_id = ObjectId(id)
        document = await collection.find_one({"_id": obj_id})
        document = serialize_task(document)

        if not document:
            return None

        # Obtener permisos desde la tarea
        if document.get("creator") == user_email:
            permission = "admin"
        else:
            permission = None
            # Buscar permiso directo en la tarea
            for col in document.get("collaborators", []):
                if col["email"] == user_email:
                    permission = col.get("permission", "read")
                    break

            # Si no hay permiso directo, consultar permisos del proyecto
            if not permission and document.get("projectId"):
                project = await project_collection.find_one(
                    {"_id": ObjectId(document["projectId"])}
                )
                if project:
                    if project.get("user_id") == user_id:
                        permission = "admin"
                    else:
                        for col in project.get("collaborators", []):
                            if col["email"] == user_email:
                                permission = col.get("permission", "read")
                                break

        if not permission:
            print(f"[get_one_task_id] Usuario sin permisos para ver esta tarea")
            return None

        document["effective_permission"] = permission
        return document

    except (InvalidId, TypeError, ValueError) as e:
        print(f"[get_one_task_id] Error al convertir ID: {id} -> {e}")
        return None


# ================== Obtener todas las tareas con filtros y permisos ==================
async def get_all_tasks(filters: dict):
    print(f"[get_all_tasks] Filtros recibidos: {filters}")
    query = {}
    user_id = filters.get("user_id")
    user_email = filters.get("user_email")
    project_id = filters.get("project_id")

    project_permissions = {}
    project_ids = []

    # === Consulta de proyectos donde el usuario tiene permisos ===
    project_query = {
        "$or": [
            {"user_id": user_id},
            {"collaborators": {"$elemMatch": {"email": user_email}}},
        ]
    }

    print(f"[get_all_tasks] Consulta de proyectos con acceso: {project_query}")
    cursor = project_collection.find(project_query)
    async for project in cursor:
        pid = project["_id"]
        project_ids.append(pid)

        pid_str = str(pid)
        if project.get("user_id") == user_id:
            project_permissions[pid_str] = "admin"
        else:
            for col in project.get("collaborators", []):
                if col["email"] == user_email:
                    project_permissions[pid_str] = col.get("permission", "read")

    # === Condiciones base para filtrar tareas donde el usuario tiene acceso directo o heredado ===
    base_conditions = [
        {"creator": user_email},
        {"collaborators": {"$elemMatch": {"email": user_email}}},
    ]
    if project_ids:
        base_conditions.append({"projectId": {"$in": project_ids}})

    # === Si se filtra por un projectId específico, ajustamos la lógica para incluir tareas si tiene acceso al proyecto ===
    if project_id:
        try:
            project_oid = ObjectId(project_id)
            query["projectId"] = project_oid

            has_project_access = False
            project_doc = await project_collection.find_one({"_id": project_oid})

            if project_doc:
                if project_doc.get("user_id") == user_id:
                    has_project_access = True
                else:
                    for col in project_doc.get("collaborators", []):
                        if col["email"] == user_email:
                            has_project_access = True
                            break

            print(
                f"[get_all_tasks] ¿Usuario tiene acceso al proyecto {project_id}? {has_project_access}"
            )

            if not has_project_access:
                # Si no tiene acceso directo al proyecto, limitar tareas visibles
                query["$and"] = [
                    {"projectId": project_oid},
                    {
                        "$or": [
                            {"creator": user_email},
                            {"collaborators": {"$elemMatch": {"email": user_email}}},
                        ]
                    },
                ]
        except Exception as e:
            print(f"[ERROR] ID de proyecto inválido: {project_id} -> {e}")
            query["$or"] = base_conditions
    else:
        query["$or"] = base_conditions

    # === Filtros adicionales opcionales ===
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
    if filters.get("has_recurso") == "yes":
        query["recurso"] = {"$ne": None}
    elif filters.get("has_recurso") == "no":
        query["recurso"] = None

    print(f"[get_all_tasks] Consulta Mongo final: {query}")

    tasks = []
    cursor = collection.find(query)
    async for document in cursor:
        document = serialize_task(document)
        project_oid = document.get("projectId")
        project_id_str = str(project_oid) if project_oid else None

        permission = None

        if document.get("creator") == user_email:
            permission = "admin"
        if not permission:
            for col in document.get("collaborators", []):
                if col["email"] == user_email:
                    permission = col.get("permission", "read")
                    break
        if not permission and project_id_str in project_permissions:
            permission = project_permissions[project_id_str]

        if not permission:
            print(f"[get_all_tasks] Sin permisos para la tarea: {document['id']}")
            continue

        document["effective_permission"] = permission
        print(
            f"[get_all_tasks] Permiso efectivo para tarea {document['id']}: {permission}"
        )
        tasks.append(document)

    print(f"[get_all_tasks] Total tareas encontradas: {len(tasks)}")
    return tasks


# ================== Crear una nueva tarea ==================
async def create_task(task: dict):
    print(f"[create_task] Datos recibidos: {task}")
    if "projectId" in task and isinstance(task["projectId"], str):
        try:
            task["projectId"] = ObjectId(task["projectId"])
        except:
            raise ValueError("projectId inválido")

    task["status"] = normalize_status(task.get("status", "pendiente"))

    # === Validar y limpiar colaboradores ===
    collaborators = task.get("collaborators", [])
    if isinstance(collaborators, str):
        try:
            collaborators = json.loads(collaborators)
        except:
            collaborators = []
    if not isinstance(collaborators, list):
        collaborators = []

    task["collaborators"] = [
        {"email": col.get("email", ""), "permission": col.get("permission", "read")}
        for col in collaborators
        if isinstance(col, dict)
    ]

    task.setdefault("deadline", None)
    task.setdefault("recurso", [])

    new_task = await collection.insert_one(task)
    created_task = await collection.find_one({"_id": new_task.inserted_id})
    print(f"[create_task] Tarea creada con ID: {new_task.inserted_id}")
    return serialize_task(created_task)


# ================== Actualizar una tarea existente con validación de permisos ==================
async def update_task(id: str, data: dict):
    print(f"[update_task] ID: {id} | Datos: {data}")
    task_data = data.copy()

    if "projectId" in task_data and isinstance(task_data["projectId"], str):
        try:
            task_data["projectId"] = ObjectId(task_data["projectId"])
        except:
            raise ValueError("projectId inválido")

    if "status" in task_data:
        task_data["status"] = normalize_status(task_data["status"])

    # === Validar y limpiar colaboradores si se incluye ===
    if "collaborators" in task_data:
        collaborators = task_data["collaborators"]
        if isinstance(collaborators, str):
            try:
                collaborators = json.loads(collaborators)
            except:
                collaborators = []
        if not isinstance(collaborators, list):
            collaborators = []

        task_data["collaborators"] = [
            {"email": col.get("email", ""), "permission": col.get("permission", "read")}
            for col in collaborators
            if isinstance(col, dict)
        ]

    user_email = data.get("user_email")
    user_id = data.get("user_id")

    if not user_email or not user_id:
        raise ValueError("Faltan datos del usuario (user_email o user_id)")

    existing_task = await collection.find_one({"_id": ObjectId(id)})
    if not existing_task:
        raise ValueError("Tarea no encontrada")

    has_permission = False

    if existing_task.get("creator") == user_email:
        has_permission = True

    for col in existing_task.get("collaborators", []):
        if col["email"] == user_email and col.get("permission") in ["write", "admin"]:
            has_permission = True
            break

    project_id = existing_task.get("projectId")
    if project_id:
        project = await project_collection.find_one({"_id": project_id})
        if project:
            if project.get("user_id") == user_id:
                has_permission = True
            else:
                for col in project.get("collaborators", []):
                    if col["email"] == user_email and col.get("permission") in [
                        "write",
                        "admin",
                    ]:
                        has_permission = True
                        break

    if not has_permission:
        raise PermissionError("No tienes permisos para editar esta tarea.")

    await collection.update_one({"_id": ObjectId(id)}, {"$set": task_data})
    updated_task = await collection.find_one({"_id": ObjectId(id)})
    print(f"[update_task] Tarea actualizada: {updated_task}")
    return serialize_task(updated_task)


# ================== Actualizar solo el estado de una tarea ==================
async def update_task_status(id: str, new_status: str):
    print(f"[update_task_status] ID: {id} | Nuevo estado: {new_status}")
    normalized = normalize_status(new_status)
    result = await collection.update_one(
        {"_id": ObjectId(id)}, {"$set": {"status": normalized}}
    )
    if result.modified_count == 1:
        updated = await collection.find_one({"_id": ObjectId(id)})
        print(f"[update_task_status] Estado actualizado correctamente")
        return serialize_task(updated)
    print(f"[update_task_status] No se modificó ninguna tarea")
    return None


# ================== Eliminar una tarea por ID con validación de permisos ==================
async def delete_task(id: str, user_email: str, user_id: str):
    print(f"[delete_task] Eliminando tarea ID: {id} | Usuario: {user_email}")

    if not user_email or not user_id:
        raise ValueError("Faltan datos del usuario (user_email o user_id)")

    existing_task = await collection.find_one({"_id": ObjectId(id)})
    if not existing_task:
        raise ValueError("Tarea no encontrada")

    has_permission = False

    if existing_task.get("creator") == user_email:
        has_permission = True

    for col in existing_task.get("collaborators", []):
        if col["email"] == user_email and col.get("permission") == "admin":
            has_permission = True
            break

    project_id = existing_task.get("projectId")
    if project_id:
        project = await project_collection.find_one({"_id": project_id})
        if project:
            if project.get("user_id") == user_id:
                has_permission = True
            else:
                for col in project.get("collaborators", []):
                    if col["email"] == user_email and col.get("permission") == "admin":
                        has_permission = True
                        break

    if not has_permission:
        raise PermissionError("No tienes permisos para eliminar esta tarea.")

    await collection.delete_one({"_id": ObjectId(id)})
    return True


# ================== Eliminar todas las tareas asociadas a un proyecto ==================
async def delete_tasks_by_project(project_id: str):
    print(f"[delete_tasks_by_project] Proyecto: {project_id}")
    try:
        project_oid = ObjectId(project_id)
        result = await collection.delete_many({"projectId": project_oid})
        print(f"[delete_tasks_by_project] Tareas eliminadas: {result.deleted_count}")
        return {"deleted_count": result.deleted_count}
    except Exception as e:
        print(f"[ERROR] No se pudieron eliminar tareas del proyecto {project_id}: {e}")
        return {"deleted_count": 0, "error": str(e)}
