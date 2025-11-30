# queue_backend/api/views.py
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

# token auth
from rest_framework.authtoken.models import Token as AuthToken

# defensive model & serializer imports
from . import models as _models
from .serializers import (
    ProviderSerializer,
    ServiceSerializer,
    TokenSerializer,
    RegisterSerializer,
    LoginSerializer,
    AuditLogSerializer,
)

User = get_user_model()

# Resolve token model name (QueueToken vs Token)
QueueToken = None
for name in ("QueueToken", "Token", "TokenModel"):
    QueueToken = getattr(_models, name, None)
    if QueueToken:
        break

Service = getattr(_models, "Service", None)
Provider = getattr(_models, "Provider", None)
AuditLog = getattr(_models, "AuditLog", None)

if Service is None:
    raise ImportError("Service model not found in queue_backend.api.models. Please ensure `Service` exists.")


# -----------------------
# ProviderViewSet
# -----------------------
class ProviderViewSet(viewsets.ModelViewSet):
    """
    CRUD for Providers (Hospitals).
    """
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Assign current user as admin of the provider
        serializer.save(admin=self.request.user)


# -----------------------
# ServiceViewSet
# -----------------------
class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD for services.
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Service.objects.all()
        provider_id = self.request.query_params.get('provider')
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)
        return queryset

    def perform_create(self, serializer):
        provider = serializer.validated_data.get('provider')
        if not provider:
            # Try to find a provider managed by this user
            provider = Provider.objects.filter(admin=self.request.user).first()
            if not provider:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"provider": "No provider found for this user. Please create a provider first."})
            serializer.save(provider=provider)
        else:
            serializer.save()


# -----------------------
# TokenViewSet
# -----------------------
from django.utils import timezone

# ... (imports)

# -----------------------
# TokenViewSet
# -----------------------
class TokenViewSet(viewsets.ModelViewSet):
    """
    Create/list/update tokens. Creating a token auto-assigns next token_number.
    """
    if QueueToken is None:
        # fallback empty queryset to avoid import errors; will raise runtime errors on use
        queryset = []
        serializer_class = TokenSerializer
    else:
        queryset = QueueToken.objects.all().order_by("-id")  # ordering for admin lists
        serializer_class = TokenSerializer

    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Assigns next token_number for the chosen service and attaches request.user.
        """
        if QueueToken is None:
            raise RuntimeError("QueueToken model not found; cannot create token.")

        user = self.request.user if self.request.user and self.request.user.is_authenticated else None
        service = serializer.validated_data.get("service")

        # find last token number for service TODAY
        today = timezone.now().date()
        last_token = (
            QueueToken.objects.filter(service=service, issued_at__date=today).order_by("-token_number").first()
        )
        next_number = last_token.token_number + 1 if last_token else 1

        serializer.save(user=user, token_number=next_number, status="waiting")


# -----------------------
# TokensByServiceView
# -----------------------
class TokensByServiceView(APIView):
    """
    GET /api/tokens-by-service/?service=<id>
    Returns tokens for a specific service ordered by token_number (or created/issued timestamp).
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        service_id = request.query_params.get("service")
        if not service_id:
            return Response({"detail": "Missing 'service' query parameter"}, status=400)

        if QueueToken is None:
            return Response({"detail": "Token model missing"}, status=500)

        # Filter by TODAY only
        today = timezone.now().date()
        tokens = QueueToken.objects.filter(service_id=service_id, issued_at__date=today).order_by("token_number")
        serializer = TokenSerializer(tokens, many=True)
        return Response(serializer.data)


# -----------------------
# Register / Login Views
# -----------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        print(f"Register attempt data: {request.data}")
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Register validation errors: {serializer.errors}")
            return Response(serializer.errors, status=400)

        user = serializer.save()
        token_obj, _ = AuthToken.objects.get_or_create(user=user)
        print(f"Register success: {user.username}")
        return Response({
            "username": user.username,
            "token": token_obj.key,
            "user_id": user.id,
            "is_staff": user.is_staff
        }, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        username = serializer.validated_data.get("username")
        password = serializer.validated_data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"non_field_errors": ["Invalid credentials"]}, status=400)

        token_obj, _ = AuthToken.objects.get_or_create(user=user)
        return Response({
            "username": user.username,
            "token": token_obj.key,
            "user_id": user.id,
            "is_staff": user.is_staff
        })
