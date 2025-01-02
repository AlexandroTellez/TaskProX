from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

# Custom ObjectId class for Pydantic validation
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v, *args, **kwargs):
        # 1) If it's already an ObjectId, accept it as is
        if isinstance(v, ObjectId):
            return v
        
        # 2) If it's a string and a valid ObjectId, convert it
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        
        # 3) In any other case, it's invalid
        raise ValueError("Invalid ObjectId")

# Task class representing a task in the application.
"""
Attributes in the Task class:
    id (Optional[PyObjectId]): Unique identifier for the task, defaults to None.
    title (str): Title of the task.
    description (Optional[str]): Detailed description of the task, defaults to None.
    completed (bool): Status indicating if the task is completed, defaults to False.
Config:
    from_attributes (bool): Enables model creation from attributes.
    populate_by_name (bool): Allows population of fields by their alias names.
    json_encoders (dict): Custom JSON encoders for specific types.
    arbitrary_types_allowed (bool): Allows arbitrary types for model fields.
"""
class Task(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    title: str
    description: Optional [str] = None
    completed: bool = False

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True