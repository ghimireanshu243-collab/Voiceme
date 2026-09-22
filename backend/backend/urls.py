from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('api/', include('flashcards.urls')),
    path('api/', include('attentionbell.urls')),
    path('api/', include('dashboard.urls')),
]