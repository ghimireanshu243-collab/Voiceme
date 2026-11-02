from django.urls import path
from .views import contextual_flashcards, contextual_flashcard_audio

urlpatterns = [
    path('assistant/flashcards/', contextual_flashcards, name='assistant-flashcards'),
    path('assistant/flashcards/audio/<str:step_id>/<str:lang>/', contextual_flashcard_audio, name='assistant-flashcard-audio'),
]
