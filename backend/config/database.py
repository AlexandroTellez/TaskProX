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
            pass  # si no es un ObjectId válido, no filtra
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
    new_task = await collection.insert_one(task)
    created_task = await collection.find_one({'_id': new_task.inserted_id})
    return Task(**created_task)

async def update_task(id: str, data):
    task_data = {k: v for k, v in data.dict().items() if v is not None}
    if "projectId" in task_data and isinstance(task_data["projectId"], str):
        try:
            task_data["projectId"] = ObjectId(task_data["projectId"])
        except:
            raise ValueError("projectId inválido")
    await collection.update_one({'_id': ObjectId(id)}, {'$set': task_data})
    document = await collection.find_one({'_id': ObjectId(id)})
    return document

async def delete_task(id: str):
    await collection.delete_one({'_id': ObjectId(id)})
    return True

# ================== PROYECTOS ==================

project_collection = database.projects

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
