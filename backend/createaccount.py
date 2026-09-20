from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["your_app_database"]
users = db["users"]

from flask import Flask, request, jsonify
import bcrypt

app = Flask(__name__)

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "All fields are required"
        }), 400

    # Check existing account
    if users.find_one({"email": email}):
        return jsonify({
            "message": "Email already registered"
        }), 409

    # Hash password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "name": name,
        "email": email,
        "password": hashed_password.decode("utf-8")
    }

    result = users.insert_one(user)

    return jsonify({
        "message": "Account created successfully",
        "userId": str(result.inserted_id)
    }), 201