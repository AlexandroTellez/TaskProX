from motor.motor_asyncio import AsyncIOMotorClient
from models.models import Task, UpdateTask, Project
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncIOMotorClient(
    'mongodb+srv://alextellezyanes:WICQnkiiQHDFT7m9@cluster0.znd5ghq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)
database = client.taskdb
collection = database.tasks
project_collection = database.projects

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
        return "Pendiente"  # Valor por defecto si es inválido

# ================== TAREAS ==================

async def get_one_task_id(id):
    task = await collection.find_one({'_id': ObjectId(id)})
    return task

async def get_all_tasks(project_id=None):
    query = {}
    if project_id:
        try:
            query["projectId"] = ObjectId(project_id)
        except:
            pass  # Si no es un ObjectId válido, no filtra
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

    task_data = dict(task)
    if "deadline" not in task_data:
        task_data["deadline"] = None

    new_task = await collection.insert_one(task_data)
    created_task = await collection.find_one({'_id': new_task.inserted_id})
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

    # Aseguramos que deadline esté presente aunque sea None
    if "deadline" not in task_data:
        task_data["deadline"] = None

    await collection.update_one({'_id': ObjectId(id)}, {'$set': task_data})
    document = await collection.find_one({'_id': ObjectId(id)})
    return document

async def delete_task(id: str):
    await collection.delete_one({'_id': ObjectId(id)})
    return True

# ================== PROYECTOS ==================

async def get_all_projects():
    projects = []
    cursor = project_collection.find({})
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
    await project_collection.update_one({'_id': ObjectId(id)}, {'$set': data})
    updated = await project_collection.find_one({'_id': ObjectId(id)})
    return Project(**updated)

async def delete_project(id: str):
    await project_collection.delete_one({'_id': ObjectId(id)})
    return True

async def get_projects_with_progress():
    projects_cursor = project_collection.find({})
    projects = []

    async for project in projects_cursor:
        project_id = project["_id"]
        task_cursor = collection.find({"projectId": project_id})
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

        projects.append({
            "_id": str(project_id),
            "name": project.get("name"),
            "description": project.get("description", "No hay descripción disponible"),
            "status": status
        })

    return projects
