# queue_backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProviderViewSet,
    ServiceViewSet,
    TokenViewSet,
    TokensByServiceView,
    RegisterView,
    LoginView
)

router = DefaultRouter()
router.register(r'providers', ProviderViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'tokens', TokenViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('tokens-by-service/', TokensByServiceView.as_view(), name='tokens-by-service'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
