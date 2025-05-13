import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from passlib.context import CryptContext
from models.models import Task, UpdateTask, Project, UserCreate, Collaborator
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_datetime

# ================== CARGA DE VARIABLES DE ENTORNO ==================
load_dotenv()

# ================== ENCRIPTADOR DE CONTRASEÑAS ==================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ================== CONEXIÓN DB ==================
mongo_url = os.getenv("MONGO_URL")
if not mongo_url:
    raise ValueError("MONGO_URL no está definido en el archivo .env")

client = AsyncIOMotorClient(mongo_url)
database = client.taskdb
collection = database.tasks
project_collection = database.projects
user_collection = database.users

__all__ = ["pwd_context", "user_collection"]

# ================== UTILIDADES ==================

def normalize_status(status):
    status = str(status).strip().lower()
    if status == "completado":
        return "Completado"
    elif status == "en proceso":
        return "En proceso"
    elif status == "pendiente":
        return "Pendiente"
    elif status == "en espera":
        return "En espera"
    elif status == "cancelado":
        return "Cancelado"
    else:
        return "Pendiente"


def parse_date_safe(date_str):
    try:
        return parse_datetime(date_str)
    except Exception as e:
        print(f" Error al parsear fecha: {date_str} -> {e}")
        return None


# ================== TAREAS ==================

async def get_one_task_id(id):
    return await collection.find_one({"_id": ObjectId(id)})


async def get_all_tasks(filters: dict):
    query = {}

    if filters.get("project_id"):
        try:
            query["projectId"] = ObjectId(filters["project_id"])
        except:
            pass

    if filters.get("user_id") and filters.get("user_email"):
        query["$or"] = [
            {"user_id": filters["user_id"]},
            {"collaborators": {"$elemMatch": {"email": filters["user_email"]}}},
        ]

    if filters.get("title"):
        query["title"] = {"$regex": filters["title"], "$options": "i"}

    if filters.get("creator"):
        query["creator_name"] = {"$regex": filters["creator"], "$options": "i"}

    if filters.get("status"):
        query["status"] = normalize_status(filters["status"])

    if filters.get("startDate"):
        try:
            start_date = parse_date_safe(filters["startDate"])
            if start_date:
                query["startDate"] = {
                    "$gte": start_date,
                    "$lt": start_date + timedelta(days=1),
                }
        except Exception as e:
            print(f" Error al parsear startDate: {filters['startDate']} -> {e}")

    if filters.get("deadline"):
        try:
            deadline = parse_date_safe(filters["deadline"])
            if deadline:
                query["deadline"] = {
                    "$gte": deadline,
                    "$lt": deadline + timedelta(days=1),
                }
        except Exception as e:
            print(f" Error al parsear deadline: {filters['deadline']} -> {e}")

    tasks = []
    cursor = collection.find(query)
    async for document in cursor:
        for date_field in ["startDate", "deadline"]:
            if date_field in document and isinstance(document[date_field], str):
                document[date_field] = parse_date_safe(document[date_field])
        tasks.append(Task(**document))

    return tasks


async def create_task(task):
    if "projectId" in task and isinstance(task["projectId"], str):
        try:
            task["projectId"] = ObjectId(task["projectId"])
        except:
            raise ValueError("projectId inválido")

    if "status" in task:
        task["status"] = normalize_status(task["status"])

    for date_field in ["startDate", "deadline"]:
        if task.get(date_field):
            if isinstance(task[date_field], str):
                task[date_field] = parse_date_safe(task[date_field])

    if "deadline" not in task:
        task["deadline"] = None

    if "collaborators" not in task:
        task["collaborators"] = []

    task_data = dict(task)
    new_task = await collection.insert_one(task_data)
    created_task = await collection.find_one({"_id": new_task.inserted_id})
    return Task(**created_task)


async def update_task(id: str, data):
    task_data = {k: v for k, v in data.dict().items() if v is not None}

    if "projectId" in task_data and isinstance(task_data["projectId"], str):
        try:
            task_data["projectId"] = ObjectId(task_data["projectId"])
        except:
            raise ValueError("projectId inválido")

    if "status" in task_data:
        task_data["status"] = normalize_status(task_data["status"])

    for date_field in ["startDate", "deadline"]:
        if date_field in task_data and isinstance(task_data[date_field], str):
            task_data[date_field] = parse_date_safe(task_data[date_field])

    if "deadline" not in task_data:
        task_data["deadline"] = None

    await collection.update_one({"_id": ObjectId(id)}, {"$set": task_data})
    document = await collection.find_one({"_id": ObjectId(id)})
    return document

async def delete_task(id: str):
    await collection.delete_one({"_id": ObjectId(id)})
    return True


# ================== PROYECTOS ==================

async def get_all_projects(user_id: str = None):
    query = {"user_id": user_id} if user_id else {}
    projects = []
    cursor = project_collection.find(query)
    async for document in cursor:
        projects.append(Project(**document))
    return projects

async def get_project_by_id(id: str):
    return await project_collection.find_one({"_id": ObjectId(id)})


async def create_project(data):
    new = await project_collection.insert_one(data)
    created = await project_collection.find_one({"_id": new.inserted_id})
    return Project(**created)


async def update_project(id: str, data):
    await project_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
    updated = await project_collection.find_one({"_id": ObjectId(id)})
    return Project(**updated)

async def delete_project(id: str):
    await project_collection.delete_one({"_id": ObjectId(id)})
    return True

async def get_projects_with_progress(user_id: str = None):
    query = {"user_id": user_id} if user_id else {}
    projects_cursor = project_collection.find(query)
    projects = []

    async for project in projects_cursor:
        project_id = project["_id"]
        task_cursor = collection.find({"projectId": project_id, "user_id": user_id})
        total_tasks = 0
        completed_tasks = 0

        async for task in task_cursor:
            total_tasks += 1
            task_status = normalize_status(task.get("status", ""))
            if task_status == "Completado":
                completed_tasks += 1

        if total_tasks == 0:
            status = "Pendiente"
        elif completed_tasks == total_tasks:
            status = "Completado"
        else:
            status = "En proceso"

        projects.append(
            {
                "_id": str(project_id),
                "name": project.get("name"),
                "description": project.get(
                    "description", "No hay descripción disponible"
                ),
                "status": status,
            }
        )

    return projects


# ================== USUARIOS ==================

async def get_user_by_email(email: str):
    return await user_collection.find_one({"email": email})


async def create_user(user: UserCreate):
    user_dict = user.dict()

    if not user_dict.get("first_name") or not user_dict.get("last_name"):
        raise ValueError("Nombre y apellidos son obligatorios")

    user_dict["password"] = pwd_context.hash(user.password)
    result = await user_collection.insert_one(user_dict)
    return str(result.inserted_id)


async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if user and pwd_context.verify(password, user["password"]):
        return user
    return None
