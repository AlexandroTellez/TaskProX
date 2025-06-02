"""
This module sets up a FastAPI application with CORS middleware and includes task, project, and auth routes.
It also increases the default request size limit to 15MB.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.task import task
from routes.project import project
from routes.auth import router as auth
from config.config import ALLOWED_ORIGINS
import logging

# ===============================
# LOG DE INICIO DEL SERVIDOR
# ===============================
logging.basicConfig(level=logging.INFO)
logging.info("Servidor FastAPI de TaskProX iniciado correctamente.")

# ===============================
# CREAR INSTANCIA FASTAPI
# ===============================
app = FastAPI()

# ===============================
# MIDDLEWARE: Rechazar si supera 15MB total (Content-Length)
# ===============================
@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    max_upload_size = 15 * 1024 * 1024  # 15MB
    content_length = request.headers.get("content-length")

    if content_length and int(content_length) > max_upload_size:
        return JSONResponse(
            status_code=413,
            content={"detail": "La carga supera el tamaño máximo de 15MB permitido."},
        )
    return await call_next(request)

# ===============================
# CONFIGURAR CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# ENDPOINT DE PRUEBA
# ===============================
@app.get("/")
def welcome():
    return {"message": "Bienvenido a TaskProX!"}

# ===============================
# INCLUIR RUTAS
# ===============================
app.include_router(auth)
app.include_router(task)
app.include_router(project)
