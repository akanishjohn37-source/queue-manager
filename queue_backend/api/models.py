# queue_backend/api/models.py
from django.db import models
from django.conf import settings

class Provider(models.Model):
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=255, blank=True, null=True)
    working_hours = models.CharField(max_length=100, default="09:00 AM - 02:00 PM")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="managed_providers")
    
    def __str__(self):
        return self.name


class Service(models.Model):
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name="services", null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, default="Active")

    def __str__(self):
        return f"{self.name} ({self.provider.name})"


class Token(models.Model):
    token_number = models.IntegerField()
    status = models.CharField(max_length=20, default="waiting")
    issued_at = models.DateTimeField(auto_now_add=True)
    # optional visitor_name (so frontend can show name even if user=null)
    visitor_name = models.CharField(max_length=150, blank=True, null=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    appointment_date = models.DateField(null=True, blank=True)
    appointment_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        who = self.visitor_name or (self.user.username if self.user else "User")
        return f"#{self.token_number} - {who} - {self.status}"


class AuditLog(models.Model):
    action = models.CharField(max_length=150)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    details = models.TextField(blank=True, null=True)

    def __str__(self):
        user = self.user.username if self.user else "Anonymous"
        return f"{self.timestamp:%Y-%m-%d %H:%M:%S} - {user} - {self.action}"


class ServiceStaff(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="staff_profile")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="staff_members")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.service.name}"

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=15, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message[:30]}"
