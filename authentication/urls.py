from django.urls import path
from .views import create_account, login_user, get_profile, voice_notes_list

urlpatterns = [
    path('create-account/', create_account, name='create-account'),
    path('login/', login_user, name='login'),
    path('profile/', get_profile, name='profile'),
    path('notes/', voice_notes_list, name='voice-notes'),
]