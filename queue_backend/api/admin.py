# queue_backend/api/admin.py
from django.contrib import admin
from .models import Service, Token, AuditLog, Provider

@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "location", "admin")
    search_fields = ("name", "location", "admin__username")

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status")
    search_fields = ("name",)

@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ("id", "token_number", "visitor_name", "get_username", "service", "status", "issued_at")
    list_filter = ("status", "service")
    search_fields = ("visitor_name", "user__username")
    readonly_fields = ("issued_at",)

    def get_username(self, obj):
        return obj.user.username if obj.user else None
    get_username.short_description = "User"

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "action", "user", "timestamp")
    readonly_fields = ("timestamp",)
    search_fields = ("action", "details", "user__username")
