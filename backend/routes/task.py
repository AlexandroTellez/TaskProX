from fastapi import APIRouter, HTTPException, Request
from config.database import (
    get_all_tasks,
    create_task,
    get_one_task_id,
    delete_task,
    update_task
)
from models.models import Task, UpdateTask

task = APIRouter()

# ===================== RUTAS CON PARÁMETROS =====================

@task.get('/api/tasks/{id}', response_model=Task)
async def get_task(id: str):
    tarea = await get_one_task_id(id)
    if tarea:
        return tarea
    raise HTTPException(404, f'Tarea con id {id} no encontrada')

@task.put('/api/tasks/{id}', response_model=Task)
async def put_task(id: str, task: UpdateTask):
    updated = await update_task(id, task)
    if updated:
        return updated
    raise HTTPException(404, f'Tarea con id {id} no encontrada')

@task.delete('/api/tasks/{id}')
async def remove_task(id: str):
    deleted = await delete_task(id)
    if deleted:
        return {"message": "Tarea eliminada correctamente"}
    raise HTTPException(404, f'Tarea con id {id} no encontrada')

# ===================== RUTAS SIN PARÁMETROS =====================

@task.get('/api/tasks')
async def get_tasks(request: Request):
    project_id = request.query_params.get("projectId")
    tasks = await get_all_tasks(project_id=project_id)
    return tasks

@task.post('/api/tasks', response_model=Task)
async def save_task(task: Task):
    nueva_tarea = await create_task(task.dict())
    if nueva_tarea:
        return nueva_tarea
    raise HTTPException(400, 'Algo salió mal al crear la tarea')
