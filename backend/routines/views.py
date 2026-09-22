import secrets
from datetime import datetime
from zoneinfo import ZoneInfo

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authentication.views import get_authenticated_user
from dashboard.db import children_collection
from .db import routines_collection

# Routines are a Nepali-local "day", not a UTC one, so the reset lines up
# with when the child's day actually rolls over rather than Django's UTC clock.
NEPAL_TZ = ZoneInfo('Asia/Kathmandu')


def _today_str():
    return datetime.now(NEPAL_TZ).date().isoformat()


def _apply_daily_reset(doc):
    """Uncheck every routine item once the Nepal-local day has rolled over,
    so a 'daily' routine actually starts fresh each day instead of staying
    checked off from yesterday.
    """
    if not doc:
        return doc

    today = _today_str()
    if doc.get('reset_date') == today:
        return doc

    items = doc.get('items', [])
    for item in items:
        item['completed'] = False

    routines_collection.update_one(
        {'_id': doc['_id']},
        {'$set': {'items': items, 'reset_date': today}},
    )
    doc['items'] = items
    doc['reset_date'] = today
    return doc


def _serialize_item(item):
    return {
        'id': item.get('id'),
        'time': item.get('time', ''),
        'slot_index': item.get('slot_index', 0),
        'title': item.get('title', ''),
        'icon': item.get('icon') or '⏰',
        'completed': bool(item.get('completed', False)),
    }


def _serialize_items(doc):
    items = (doc or {}).get('items', [])
    return [_serialize_item(item) for item in sorted(items, key=lambda i: i.get('slot_index', 0))]


@api_view(['GET', 'POST'])
def routine_list(request):
    """
    A child's own daily routine: what to do and at what time, first set up
    during ChildRegistrationPage and editable later from the same account.
    """
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        doc = _apply_daily_reset(routines_collection.find_one({'user_id': user_id}))
        return Response({'items': _serialize_items(doc)}, status=status.HTTP_200_OK)

    # POST replaces the whole list — the child sets up their day as a set
    # rather than one entry at a time. Items are not capped in number here;
    # the child can add as many routines as they want.
    incoming = request.data.get('items')
    if not isinstance(incoming, list):
        return Response({'error': 'A list of routine items is required.'}, status=status.HTTP_400_BAD_REQUEST)

    existing = _apply_daily_reset(routines_collection.find_one({'user_id': user_id})) or {}
    existing_by_id = {item.get('id'): item for item in existing.get('items', [])}

    items = []
    for entry in incoming:
        title = (entry.get('title') or '').strip()
        if not title:
            continue
        item_id = entry.get('id') or secrets.token_hex(4)
        # Keep the checked/unchecked state for any item the caller echoes
        # back by id, so re-saving the list doesn't reset today's progress.
        previous = existing_by_id.get(item_id, {})
        items.append({
            'id': item_id,
            'time': entry.get('time', ''),
            'slot_index': entry.get('slot_index', 0),
            'title': title,
            'icon': entry.get('icon') or '⏰',
            'completed': bool(previous.get('completed', False)),
        })

    routines_collection.update_one(
        {'user_id': user_id},
        {'$set': {'items': items, 'reset_date': _today_str()}, '$setOnInsert': {'user_id': user_id}},
        upsert=True,
    )
    return Response({'items': _serialize_items({'items': items})}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
def toggle_routine_item(request, item_id):
    user_id = get_authenticated_user(request)
    if not user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    doc = _apply_daily_reset(routines_collection.find_one({'user_id': user_id}))
    if not doc:
        return Response({'error': 'No routine found for this account.'}, status=status.HTTP_404_NOT_FOUND)

    items = doc.get('items', [])
    found = False
    for item in items:
        if item.get('id') == item_id:
            item['completed'] = not item.get('completed', False)
            found = True
            break

    if not found:
        return Response({'error': 'Routine item not found.'}, status=status.HTTP_404_NOT_FOUND)

    routines_collection.update_one({'user_id': user_id}, {'$set': {'items': items}})
    return Response({'items': _serialize_items({'items': items})}, status=status.HTTP_200_OK)


@api_view(['GET'])
def caregiver_routines(request):
    """
    Read-only view of the connected child's routine for the caregiver's own
    dashboard, resolved the same way caregiver_dashboard finds its child: via
    the caregiver contact's own account id stored on the child document.
    """
    caregiver_user_id = get_authenticated_user(request)
    if not caregiver_user_id:
        return Response({'error': 'Unauthorized access.'}, status=status.HTTP_401_UNAUTHORIZED)

    child = children_collection.find_one({'caregiver.user_id': caregiver_user_id})
    if not child:
        return Response(
            {'error': 'Not connected to a child yet. Ask the parent for their connect code.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    doc = _apply_daily_reset(routines_collection.find_one({'user_id': child.get('user_id')}))
    return Response({'items': _serialize_items(doc)}, status=status.HTTP_200_OK)
