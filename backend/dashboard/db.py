from pymongo import ASCENDING
from pymongo.errors import PyMongoError

from authentication.db import db

# Collections
children_collection = db['children']
sos_alerts_collection = db['sos_alerts']

try:
    # Sparse: older docs saved before connect codes existed have no such field.
    children_collection.create_index([('connect_code', ASCENDING)], unique=True, sparse=True)
except PyMongoError:
    pass
