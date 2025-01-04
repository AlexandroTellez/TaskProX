from fastapi import APIRouter, HTTPException
from database import get_all_tasks, create_task, get_one_task, get_one_task_id, delete_task, update_task
from models import Task, UpdateTask

task = APIRouter()

# Routes with parameters must go first
@task.get('/api/tasks/{id}', response_model=Task)
async def get_task(id: str):
    # Find a task by its ID
    task = await get_one_task_id(id)
    if task:
        # If the task is found, return it
        return task
    # If the task is not found, raise an HTTP 404 Not Found exception
    raise HTTPException(404, f'Task with id {id} not found')

@task.put('/api/tasks/{id}', response_model=Task)
async def put_task(id: str, task: UpdateTask):
    # Update a task by its ID
    response = await update_task(id, task)
    if response:
        # If the task is successfully updated, return the updated task
        return response
    # If the task is not found, raise an HTTP 404 Not Found exception
    raise HTTPException(404, f"Task with id {id} not found")

@task.delete('/api/tasks/{id}')
async def remove_task(id: str):
    # Delete a task by its ID
    response = await delete_task(id)
    if response:
        # If the task is successfully deleted, return a success message
        return "Successfully deleted task"
    # If the task is not found, raise an HTTP 404 Not Found exception
    raise HTTPException(404, f'Task with id {id} not found')

# Routes without parameters must go after
@task.get('/api/tasks')
async def get_tasks():
    tasks = await get_all_tasks()
    return tasks

@task.post('/api/tasks', response_model=Task)
async def save_task(task: Task):
    # Check if a task with the same title already exists
    taskFound = await get_one_task(task.title)
    if taskFound:
        # If a task with the same title exists, raise an HTTP 409 Conflict exception
        raise HTTPException(409, "Task already exists")

    # Create a new task in the database
    response = await create_task(task.dict())
    if response:
        # If the task is successfully created, return the created task
        return response
    # If something goes wrong, raise an HTTP 400 Bad Request exception
    raise HTTPException(400, 'Something went wrong')
