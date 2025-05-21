from bson import ObjectId
from models.models import UserCreate
from config.database import user_collection
from services.utils import pwd_context


async def get_user_by_email(email: str):
    return await user_collection.find_one({"email": email})


async def create_user(user: UserCreate):
    user_dict = user.model_dump()

    if not user_dict.get("first_name") or not user_dict.get("last_name"):
        raise ValueError("Nombre y apellidos son obligatorios")

    user_dict["password"] = pwd_context.hash(user.password)
    result = await user_collection.insert_one(user_dict)
    return str(result.inserted_id)


async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if user and pwd_context.verify(password, user["password"]):
        return user
    return None
