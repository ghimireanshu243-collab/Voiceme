from django.urls import path
from .views import routine_list, toggle_routine_item, caregiver_routines

urlpatterns = [
    path('routines/', routine_list, name='routine-list'),
    path('routines/<str:item_id>/toggle/', toggle_routine_item, name='routine-toggle'),
    path('caregiver/routines/', caregiver_routines, name='caregiver-routines'),
]
