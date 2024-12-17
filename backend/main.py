from fastapi import FastAPI

app = FastAPI()

@app.get('/')
def welcome():
    return{'message':'Welcome to the FastAPI API!'}

# Routes with parameters must go first
@app.get('/api/tasks/{id}')
async def get_task(id: int): # We declare id as parameter
    return 'single task'

@app.put('/api/tasks/{id}')
async def update_task(id: int): # We declare id as parameter
    return 'updating task'

@app.delete('/api/tasks/{id}')
async def delete_tasks(id: int): # We declare id as parameter
    return 'delete task'

# Routes without parameters must go after
@app.get('/api/tasks')
async def get_tasks():
    return 'all tasks'

@app.post('/api/tasks')
async def create_task():
    return 'create task'

