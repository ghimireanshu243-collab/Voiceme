import os
import sys

from django.apps import AppConfig


class RoutinesConfig(AppConfig):
    name = 'routines'

    def ready(self):
        # `runserver`'s autoreloader calls ready() in a parent watcher
        # process (no RUN_MAIN set) before forking the actual worker process
        # (RUN_MAIN='true'); only the worker should start the background
        # thread, or every reload would leak another one.
        if 'runserver' in sys.argv and '--noreload' not in sys.argv and os.environ.get('RUN_MAIN') != 'true':
            return

        from .scheduler import start_daily_reset_scheduler
        start_daily_reset_scheduler()
