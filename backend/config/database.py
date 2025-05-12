import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from passlib.context import CryptContext
from models.models import Task, UpdateTask, Project, UserCreate, Collaborator

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


# ================== UTILIDAD ==================
def normalize_status(status):
    status = str(status).strip().lower()
    if status == "completado":
        return "Completado"
    elif status == "en proceso":
        return "En proceso"
    elif status == "pendiente":
        return "Pendiente"
    else:
        return "Pendiente"


# ================== TAREAS ==================


async def get_one_task_id(id):
    task = await collection.find_one({"_id": ObjectId(id)})
    return task


async def get_all_tasks(project_id=None, user_id: str = None, user_email: str = None):
    query = {}
    if project_id:
        try:
            query["projectId"] = ObjectId(project_id)
        except:
            pass
    if user_id and user_email:
        query["$or"] = [
            {"user_id": user_id},
            {"collaborators": {"$elemMatch": {"email": user_email}}},
        ]
    tasks = []
    cursor = collection.find(query)
    async for document in cursor:
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

    # Asegurar campos esenciales
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
