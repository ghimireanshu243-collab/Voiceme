from django.urls import path
from .views import (
    create_account,
    login_user,
    delete_account,
    forgot_password,
    reset_password,
    get_profile,
    voice_notes_list,
)

urlpatterns = [
    path('create-account/', create_account, name='create-account'),
    path('login/', login_user, name='login'),
    path('delete-account/', delete_account, name='delete-account'),
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/<str:token>/', reset_password, name='reset-password'),
    path('profile/', get_profile, name='profile'),
    path('notes/', voice_notes_list, name='voice-notes'),
]