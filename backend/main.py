from fastapi import FastAPI
from routes.task import task

app = FastAPI()

@app.get('/')
def welcome():
    return{'message':'Welcome to the FastAPI API!'}

# Include the task router
app.include_router(task)

