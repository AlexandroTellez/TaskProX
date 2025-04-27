# This file is used to connect to the MongoDB database using the motor library.
# Import the necessary libraries and modules
from motor. motor_asyncio import AsyncIOMotorClient
from models.models import Task
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()
# Load environment variables from .env file

# We have created a connection to the MongoDB database and a reference to the tasks collection.
client = AsyncIOMotorClient('mongodb+srv://alextellezyanes:WICQnkiiQHDFT7m9@cluster0.znd5ghq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
database = client.taskdb
collection = database.tasks

# Function to get a single task by its ID
async def get_one_task_id(id):
    # Find one document in the collection with the specified ID
    task = await collection.find_one({'_id': ObjectId(id)})
    return task

async def get_one_task(title):
    # Find one document in the collection with the specified title
    task = await collection.find_one({'title': title})
    return task

# Function to get all tasks from the collection
async def get_all_tasks():
    tasks = []
    # Find all documents in the collection
    cursor = collection.find({})
    # Iterate over the cursor to get each document
    async for document in cursor:
        # Append each document to the tasks list as a Task object
        tasks.append(Task(**document))
    return tasks

# Function to create a new task in the collection
async def create_task(task):
    # Insert the new task into the collection
    new_task = await collection.insert_one(task)
    # Find the newly created task by its inserted ID
    created_task = await collection.find_one({'_id': new_task.inserted_id})
    # Return the created task as a Task object
    return Task(**created_task)

# Function to update an existing task by its ID
async def update_task(id: str, data):
    # Create a dictionary of the task data, excluding any fields that are None
    task = {k: v for k, v in data.dict().items() if v is not None}
    print(task)
    # Update the document with the specified ID in the collection
    await collection.update_one({'_id': ObjectId(id)}, {'$set': task})
    # Find the updated document
    document = await collection.find_one({'_id': ObjectId(id)})
    # Return the updated document
    return document

# Function to delete a task by its ID
async def delete_task(id: str):
    # Delete the document with the specified ID
    await collection.delete_one({'_id': ObjectId(id)})
    return True

