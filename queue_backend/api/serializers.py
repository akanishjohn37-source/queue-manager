# queue_backend/api/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

# import local models module (defensive)
from . import models as _models

User = get_user_model()

# Try common token model names used in this project (defensive)
TokenModel = getattr(_models, "QueueToken", None) or getattr(_models, "Token", None) or getattr(_models, "TokenModel", None)
ServiceModel = getattr(_models, "Service", None)
ProviderModel = getattr(_models, "Provider", None)
AuditLogModel = getattr(_models, "AuditLog", None)


# -------------------------
# Provider Serializer
# -------------------------
class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = _models.Provider
        fields = "__all__"
        extra_kwargs = {'admin': {'read_only': True}}


# -------------------------
# Service Serializer
# -------------------------
if ServiceModel is None:
    # fallback serializer so imports don't crash; you should have Service model defined
    class ServiceSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        name = serializers.CharField()
        description = serializers.CharField(allow_blank=True, required=False)
else:
    class ServiceSerializer(serializers.ModelSerializer):
        provider_name = serializers.ReadOnlyField(source='provider.name')

        class Meta:
            model = ServiceModel
            fields = "__all__"
            extra_kwargs = {'provider': {'required': False}}


# -------------------------
# Token Serializer
# -------------------------
if TokenModel is None:
    # fallback plain serializer when no model found — keeps API code importable during early dev
    class TokenSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        token_number = serializers.IntegerField(read_only=True)
        service = serializers.IntegerField()  # service id
        status = serializers.CharField(read_only=True)
        issued_at = serializers.DateTimeField(read_only=True, required=False)
        user = serializers.PrimaryKeyRelatedField(read_only=True)
        visitor_name = serializers.CharField(allow_blank=True, required=False)

        service_name = serializers.SerializerMethodField()

        def get_service_name(self, obj):
            # obj may be dict (fallback) or model instance
            if isinstance(obj, dict):
                return obj.get("service_name") or obj.get("service")
            return getattr(obj, "service_name", getattr(obj, "service", None))
else:
    class TokenSerializer(serializers.ModelSerializer):
        service_name = serializers.SerializerMethodField(read_only=True)

        class Meta:
            model = TokenModel
            # compute fields from model to avoid brittle list building
            # use model._meta.get_fields() to get field names
            model_field_names = []
            try:
                model_field_names = [f.name for f in TokenModel._meta.get_fields() if getattr(f, "concrete", True)]
            except Exception:
                # fallback minimal set
                model_field_names = ["id", "token_number", "service", "status", "issued_at", "user", "visitor_name"]

            # ensure service_name included and unique
            fields = list(dict.fromkeys(model_field_names + ["service_name"]))
            extra_kwargs = {
                "token_number": {"read_only": True},
                # "status": {"read_only": True},  <-- removed to allow updates
                "issued_at": {"read_only": True},
                "user": {"read_only": True},
            }

        def get_service_name(self, obj):
            # obj.service may be FK instance or id
            svc = getattr(obj, "service", None)
            if svc is None:
                return None
            # if service is model instance and has name
            name = getattr(svc, "name", None)
            if name:
                return name
            # else if service is integer id
            return getattr(svc, "id", None)


# -------------------------
# AuditLog Serializer (optional)
# -------------------------
if AuditLogModel is not None:
    class AuditLogSerializer(serializers.ModelSerializer):
        class Meta:
            model = AuditLogModel
            fields = "__all__"
else:
    # simple fallback so imports that expect this serializer won't fail
    class AuditLogSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        action = serializers.CharField()
        timestamp = serializers.DateTimeField(required=False)


# -------------------------
# Auth serializers: Register / Login
# -------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = ("username", "password", "password2", "email")
        extra_kwargs = {"email": {"required": False}}

    def validate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        # username uniqueness is enforced by the model, but give friendlier message
        username = data.get("username")
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "A user with that username already exists."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

# -------------------------
# Staff Management
# -------------------------
class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ServiceStaffSerializer(serializers.ModelSerializer):
    # Retrieve nested data for display
    user_name = serializers.ReadOnlyField(source='user.username')
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = _models.ServiceStaff
        fields = ['id', 'user', 'user_name', 'service', 'service_name', 'created_at']
        read_only_fields = ['created_at']
