from pymongo import ASCENDING
from pymongo.errors import PyMongoError

from authentication.db import db

# One document per child account, holding its whole day as an embedded
# `items` list (mirrors how children_collection embeds caregiver/parent).
routines_collection = db['routines']

try:
    routines_collection.create_index([('user_id', ASCENDING)], unique=True)
except PyMongoError:
    pass
