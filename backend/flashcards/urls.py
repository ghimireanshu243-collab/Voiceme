from django.urls import path
from .views import flashcard_audio

urlpatterns = [
    path('tts/flashcard/<str:card_id>/<str:lang>/', flashcard_audio, name='flashcard-audio'),
]
