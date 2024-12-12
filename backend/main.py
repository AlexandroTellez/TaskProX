from fastapi import FastAPI

app = FastAPI()

@app.get('/')
def welcome():
    return{'message':'Welcome to the FastAPI API!'}
