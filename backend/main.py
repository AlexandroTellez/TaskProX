"""
This module sets up a FastAPI application with CORS middleware and includes task, project, and auth routes.
"""

from fastapi import FastAPI
from routes.task import task
from routes.project import project
from routes.auth import router as auth
from fastapi.middleware.cors import CORSMiddleware
from config.config import ALLOWED_ORIGINS

# =========================
# CREAR INSTANCIA FASTAPI
# =========================

app = FastAPI()

# =========================
# CONFIGURAR CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Orígenes dinámicos desde config.py
    allow_credentials=True,  # Cookies y headers de autenticación
    allow_methods=["*"],  # Todos los métodos permitidos
    allow_headers=["*"],  # Todos los headers permitidos
)

# =========================
# ENDPOINT DE PRUEBA
# =========================


@app.get("/")
def welcome():
    return {"message": "Bienvenido a TaskProX!"}


# =========================
# INCLUIR RUTAS
# =========================

app.include_router(auth)
app.include_router(task)
app.include_router(project)
