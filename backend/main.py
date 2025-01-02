from fastapi import FastAPI, HTTPException
from database import get_all_tasks, create_task, get_one_task
from models import Task

app = FastAPI()

@app.get('/')
def welcome():
    return{'message':'Welcome to the FastAPI API!'}

# Routes with parameters must go first
@app.get('/api/tasks/{id}')
async def get_task():
    return 'single task'

@app.put('/api/tasks/{id}')
async def update_task():
    return 'updating task'

@app.delete('/api/tasks/{id}')
async def delete_tasks():
    return 'delete task'

# Routes without parameters must go after
@app.get('/api/tasks')
async def get_tasks():
    tasks = await get_all_tasks()
    return tasks

@app.post('/api/tasks', response_model=Task)
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

