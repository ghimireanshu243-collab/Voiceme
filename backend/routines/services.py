from datetime import datetime
from zoneinfo import ZoneInfo

from .db import routines_collection

# Routines are a Nepali-local "day", not a UTC one, so the reset lines up
# with when the child's day actually rolls over rather than Django's UTC clock.
NEPAL_TZ = ZoneInfo('Asia/Kathmandu')


def today_str():
    return datetime.now(NEPAL_TZ).date().isoformat()


def current_slot_index():
    """The 30-minute TIME_SLOTS index (0-47) for right now, Nepal-local."""
    now = datetime.now(NEPAL_TZ)
    return (now.hour * 2) + (1 if now.minute >= 30 else 0)


def apply_daily_reset(doc):
    """Uncheck every routine item once the Nepal-local day has rolled over,
    so a 'daily' routine actually starts fresh each day instead of staying
    checked off from yesterday.
    """
    if not doc:
        return doc

    today = today_str()
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
