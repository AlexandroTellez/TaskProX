import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# ================== CARGA DE VARIABLES DE ENTORNO ==================
load_dotenv()

mongo_url = os.getenv("MONGO_URL")
if not mongo_url:
    raise ValueError("MONGO_URL no está definido en el archivo .env")

# ================== CONEXIÓN A LA BASE DE DATOS ==================
client = AsyncIOMotorClient(mongo_url)
database = client.taskdb

# ================== COLECCIONES ==================
collection = database.tasks
project_collection = database.projects
user_collection = database.users

# ================== EXPORTACIONES ==================
__all__ = ["collection", "project_collection", "user_collection"]
