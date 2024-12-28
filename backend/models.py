from pydantic import BaseModel

# Task class representing a task in the application.
class Task:
    id: str
    title: str
    description: str
    completed: bool = False

"""
Attributes:
    id (str): Unique identifier of the task.
    title (str): Title of the task.
    description (str): Detailed description of the task.
    completed (bool): Indicates whether the task is completed or not. Default is False.

Usage:
    This class is used to model tasks in the task management application.

Data types in FastAPI:
    - str: String.
    - int: Integer.
    - float: Floating point number.
    - bool: Boolean value (True or False).
    - list: List of elements.
    - dict: Dictionary of key-value pairs.
    - Optional: Indicates that a field can be of a specific type or None.
    - datetime: Date and time.
    - UUID: Universal unique identifier.
"""