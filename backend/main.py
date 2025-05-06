"""
This module sets up a FastAPI application with CORS middleware and includes task routes.
Modules:
    fastapi: The FastAPI framework.
    routes.task: The task routes to be included in the application.
    fastapi.middleware.cors: Middleware for handling Cross-Origin Resource Sharing (CORS).
    config: Configuration module for application settings.
Attributes:
    app (FastAPI): The FastAPI application instance.
    origins (list): List of allowed origins for CORS.
Functions:
    welcome(): A simple welcome endpoint that returns a welcome message.
Middleware:
    CORSMiddleware: Middleware to handle CORS with specified origins, credentials, methods, and headers.
Routes:
    The task router is included in the application to handle task-related endpoints.
"""
from fastapi import FastAPI
from routes.task import task
from fastapi.middleware.cors import CORSMiddleware
import config.config as config

app = FastAPI()

origins= [
    config.FRONTEND_URL,
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.get('/')
def welcome():
    return{'message':'Bienvenido a TaskProX!'}

# Include the task router
app.include_router(task)

