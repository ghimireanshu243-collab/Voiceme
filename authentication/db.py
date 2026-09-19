import os
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Read the connection string from .env
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)
db = client['voiceme_db']

# Collections
users_collection = db['users']
notes_collection = db['voice_notes']

# Enforce Unique Email Constraint directly in MongoDB
users_collection.create_index([("email", ASCENDING)], unique=True)