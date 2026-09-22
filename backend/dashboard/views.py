import datetime
import secrets

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authentication.views import get_authenticated_user
from .db import children_collection, sos_alerts_collection


def _merge_contact(existing, incoming, id_prefix):
    """
    Merge a caregiver/parent update into whatever contact info is already on
    file, assigning a stable display id (e.g. "CG4F9A2B") the first time this
    contact is saved rather than regenerating one on every edit.
    """
    merged = dict(existing or {})
    merged.update({k: v for k, v in incoming.items() if v is not None})
    if not merged.get('id'):
        merged['id'] = f"{id_prefix}{secrets.token_hex(3).upper()}"
    return merged


def _generate_connect_code():
    """
    Short code a parent shares out-of-band (verbally, text message) so a
    caregiver's own account can be linked to this child. Retries on the
    astronomically unlikely chance of a collision.
    """
    for _ in range(5):
        code = secrets.token_hex(3).upper()
        if not children_collection.find_one({'connect_code': code}):
            return code
    return secrets.token_hex(4).upper()


def _serialize_child(child):
    return {
        'id': str(child['_id']),
        'name': child.get('name', ''),
        'age': child.get('age', ''),
        'avatar': child.get('avatar', ''),
        'caregiver': child.get('caregiver'),
        'parent': child.get('parent'),
        'gps': child.get('gps', {'connected': False, 'location_label': None, 'updated_at': None}),
        'connect_code': child.get('connect_code'),
    }


@api_view(['GET', 'POST'])
def child_profile(request):
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        child = children_collection.find_one({'user_id': user_id})
        if not child:
            return Response({'error': 'No child profile found for this account.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_child(child), status=status.HTTP_200_OK)

    # POST: create the child profile the first time, update it on later calls.
    data = request.data
    existing = children_collection.find_one({'user_id': user_id}) or {}
    update_fields = {}
    for field in ('name', 'age', 'avatar'):
        if data.get(field) is not None:
            update_fields[field] = data.get(field)
    if data.get('caregiver') is not None:
        update_fields['caregiver'] = _merge_contact(existing.get('caregiver'), data.get('caregiver'), 'CG')
    if data.get('parent') is not None:
        update_fields['parent'] = _merge_contact(existing.get('parent'), data.get('parent'), 'P')

    if not update_fields:
        return Response({'error': 'No profile fields provided.'}, status=status.HTTP_400_BAD_REQUEST)

    # Assigned once and kept stable so the parent can keep sharing the same
    # code with new caregivers later; backfilled here for any doc that
    # predates this field, not just brand new ones.
    if not existing.get('connect_code'):
        update_fields['connect_code'] = _generate_connect_code()

    children_collection.update_one(
        {'user_id': user_id},
        {
            '$set': update_fields,
            '$setOnInsert': {'user_id': user_id, 'created_at': datetime.datetime.utcnow()},
        },
        upsert=True,
    )
    child = children_collection.find_one({'user_id': user_id})
    return Response(_serialize_child(child), status=status.HTTP_200_OK)


@api_view(['GET'])
def gps_status(request):
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    child = children_collection.find_one({'user_id': user_id})
    if not child:
        return Response({'error': 'No child profile found for this account.'}, status=status.HTTP_404_NOT_FOUND)

    gps = child.get('gps') or {'connected': False, 'location_label': None, 'updated_at': None}
    return Response(gps, status=status.HTTP_200_OK)


@api_view(['POST'])
def connect_caregiver(request):
    """
    Links the caregiver's OWN account (they already registered/logged in
    separately) to a child by the code its parent shared with them, rather
    than the caregiver creating or editing the child profile directly.
    """
    caregiver_user_id = get_authenticated_user(request)
    if not caregiver_user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    data = request.data
    code = (data.get('code') or '').strip().upper()
    name = (data.get('name') or '').strip()
    if not code or not name:
        return Response({'error': 'Connect code and name are required.'}, status=status.HTTP_400_BAD_REQUEST)

    child = children_collection.find_one({'connect_code': code})
    if not child:
        return Response({'error': 'Invalid connect code.'}, status=status.HTTP_404_NOT_FOUND)

    caregiver = _merge_contact(child.get('caregiver'), {
        'name': name,
        'phone': data.get('phone'),
    }, 'CG')
    caregiver['user_id'] = caregiver_user_id

    children_collection.update_one({'_id': child['_id']}, {'$set': {'caregiver': caregiver}})
    child = children_collection.find_one({'_id': child['_id']})
    return Response(_serialize_child(child), status=status.HTTP_200_OK)


@api_view(['GET'])
def caregiver_dashboard(request):
    caregiver_user_id = get_authenticated_user(request)
    if not caregiver_user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    child = children_collection.find_one({'caregiver.user_id': caregiver_user_id})
    if not child:
        return Response(
            {'error': 'Not connected to a child yet. Ask the parent for their connect code.'},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(_serialize_child(child), status=status.HTTP_200_OK)


@api_view(['POST'])
def trigger_sos(request):
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    child = children_collection.find_one({'user_id': user_id})
    if not child:
        return Response({'error': 'No child profile found for this account.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    location_label = data.get('location_label') or (child.get('gps') or {}).get('location_label')
    lat = data.get('lat')
    lng = data.get('lng')
    now = datetime.datetime.utcnow()

    alert_doc = {
        'child_id': child['_id'],
        'user_id': user_id,
        'location_label': location_label,
        'lat': lat,
        'lng': lng,
        'created_at': now,
    }
    result = sos_alerts_collection.insert_one(alert_doc)

    return Response({
        'alert_id': str(result.inserted_id),
        'triggered_at': now.isoformat(),
        'location_label': location_label,
        'caregiver': child.get('caregiver'),
        'parent': child.get('parent'),
    }, status=status.HTTP_201_CREATED)
