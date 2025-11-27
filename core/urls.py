# core/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("queue_backend.api.urls")),  # adjust if your package name differs
]
