from django.urls import path
from .views import child_profile, gps_status, trigger_sos, connect_caregiver, caregiver_dashboard

urlpatterns = [
    path('child/profile/', child_profile, name='child-profile'),
    path('child/gps/', gps_status, name='child-gps'),
    path('sos/trigger/', trigger_sos, name='sos-trigger'),
    path('caregiver/connect/', connect_caregiver, name='caregiver-connect'),
    path('caregiver/dashboard/', caregiver_dashboard, name='caregiver-dashboard'),
]
