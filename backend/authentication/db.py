import os
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Prefer the local database for development if the remote Atlas URI is unavailable.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/voiceme_db")
FALLBACK_LOCAL_URI = "mongodb://localhost:27017/voiceme_db"

client = None
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
except Exception:
    client = MongoClient(FALLBACK_LOCAL_URI, serverSelectionTimeoutMS=5000)

# Use a local database name regardless of which URI worked.
db = client['voiceme_db']

# Collections
users_collection = db['users']
notes_collection = db['voice_notes']
password_resets_collection = db['password_resets']

# Enforce Unique Email Constraint directly in MongoDB
try:
    users_collection.create_index([("email", ASCENDING)], unique=True)
    # Only one live reset link per email, cleaned up by MongoDB once it expires.
    password_resets_collection.create_index([("email", ASCENDING)], unique=True)
    password_resets_collection.create_index([("token_hash", ASCENDING)], unique=True)
    password_resets_collection.create_index("expires_at", expireAfterSeconds=0)
except PyMongoError:
    # The server may not be running yet; the app should still boot for local development.
    pass