
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.getcwd())
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from queue_backend.api.models import UserProfile

print(f"Connected Database: {django.db.connection.settings_dict['NAME']}")

users = User.objects.all()
print(f"User Count: {users.count()}")
for u in users:
    has_profile = hasattr(u, 'profile')
    has_staff_profile = hasattr(u, 'staff_profile')
    print(f"- {u.username} (Superuser: {u.is_superuser}) | Has UserProfile: {has_profile} | Has StaffProfile: {has_staff_profile}")
