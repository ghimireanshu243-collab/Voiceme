import threading
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Same Nepal-local "day" the on-request reset in views.py uses, so both
# agree on when a day actually rolls over.
NEPAL_TZ = ZoneInfo('Asia/Kathmandu')


def _seconds_until_next_midnight():
    now = datetime.now(NEPAL_TZ)
    tomorrow = (now + timedelta(days=1)).date()
    next_midnight = datetime.combine(tomorrow, datetime.min.time(), tzinfo=NEPAL_TZ)
    return (next_midnight - now).total_seconds()


def _reset_all_routines():
    from .db import routines_collection

    today = datetime.now(NEPAL_TZ).date().isoformat()
    for doc in routines_collection.find({}):
        items = doc.get('items', [])
        changed = False
        for item in items:
            if item.get('completed'):
                item['completed'] = False
                changed = True
        if changed or doc.get('reset_date') != today:
            routines_collection.update_one(
                {'_id': doc['_id']},
                {'$set': {'items': items, 'reset_date': today}},
            )


def _run_forever():
    while True:
        # Sleeping in a loop (rather than one long sleep) keeps this
        # resilient to the sleep being interrupted or overshooting slightly.
        remaining = _seconds_until_next_midnight()
        while remaining > 0:
            time.sleep(min(remaining, 3600))
            remaining = _seconds_until_next_midnight()
            if remaining > 23 * 3600:
                # We've just crossed midnight (remaining wrapped back up to
                # ~24h), so stop waiting and run the reset.
                break

        try:
            _reset_all_routines()
        except Exception:
            # A transient DB hiccup at midnight shouldn't kill the scheduler;
            # the next loop iteration (and the per-request fallback reset in
            # views.py) will still catch everyone up.
            pass


def start_daily_reset_scheduler():
    thread = threading.Thread(target=_run_forever, daemon=True, name='routines-daily-reset')
    thread.start()
