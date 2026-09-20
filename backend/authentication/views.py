import jwt
import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from bson import ObjectId
from .db import users_collection, notes_collection

SECRET_KEY = "your_jwt_secret_key_change_in_production"

def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def get_authenticated_user(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

@api_view(['POST'])
def create_account(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if users_collection.find_one({'email': email}):
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user_doc = {
        'name': name,
        'email': email,
        'password': make_password(password),
        'created_at': datetime.datetime.utcnow()
    }

    result = users_collection.insert_one(user_doc)
    token = generate_token(result.inserted_id)

    return Response({
        'message': 'Account created successfully!',
        'token': token,
        'user_id': str(result.inserted_id)
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_user(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = users_collection.find_one({'email': email})
    if not user or not check_password(password, user['password']):
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    token = generate_token(user['_id'])
    return Response({
        'message': 'Login successful!',
        'token': token,
        'user': {'id': str(user['_id']), 'name': user.get('name'), 'email': user['email']}
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_profile(request):
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    user = users_collection.find_one({'_id': ObjectId(user_id)}, {'password': 0})
    user['_id'] = str(user['_id'])
    return Response(user, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def voice_notes_list(request):
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        notes = list(notes_collection.find({'user_id': user_id}))
        for note in notes:
            note['_id'] = str(note['_id'])
        return Response(notes, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        title = request.data.get('title', 'Untitled Note')
        audio_url = request.data.get('audio_url', '')

        note_doc = {
            'user_id': user_id,
            'title': title,
            'audio_url': audio_url,
            'created_at': datetime.datetime.utcnow()
        }
        result = notes_collection.insert_one(note_doc)
        return Response({
            'message': 'Voice note created successfully!',
            'note_id': str(result.inserted_id)
        }, status=status.HTTP_201_CREATED)