from bson import ObjectId
from models.models import Project
from config.database import project_collection, collection
from services.utils import normalize_status


async def get_all_projects(filters: dict = None):
    filters = filters or {}
    query = {}

    user_id = filters.get("user_id")
    user_email = filters.get("user_email")

    if user_id and user_email:
        query["$or"] = [
            {"user_id": user_id},
            {"collaborators": {"$elemMatch": {"email": user_email}}},
        ]

    if filters.get("name"):
        query["name"] = {"$regex": filters["name"], "$options": "i"}

    if filters.get("description"):
        query["description"] = {"$regex": filters["description"], "$options": "i"}

    projects = []
    cursor = project_collection.find(query)
    async for document in cursor:
        projects.append(Project(**document))
    return projects


async def get_project_by_id(id: str):
    return await project_collection.find_one({"_id": ObjectId(id)})


async def create_project(data: dict):
    if "collaborators" not in data or data["collaborators"] is None:
        data["collaborators"] = []

    result = await project_collection.insert_one(data)
    created = await project_collection.find_one({"_id": result.inserted_id})
    return Project(**created)


async def update_project(id: str, data):
    if isinstance(data, Project):
        data = data.model_dump(exclude_none=True)

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
            if normalize_status(task.get("status", "")) == "Completado":
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
