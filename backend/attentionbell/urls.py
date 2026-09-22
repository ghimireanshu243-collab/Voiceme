from django.urls import path
from .views import bell_ring_audio, bell_prompt_audio

urlpatterns = [
    path('bell/ring/', bell_ring_audio, name='bell-ring'),
    path('tts/bell/<str:lang>/', bell_prompt_audio, name='bell-prompt'),
]
