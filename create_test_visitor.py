
import os
import django
import sys
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.getcwd())
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from queue_backend.api.models import UserProfile

username = "visitor_tom"
if not User.objects.filter(username=username).exists():
    user = User.objects.create_user(username=username, email="tom@example.com", password="password123")
    UserProfile.objects.create(user=user, phone="1234567890", age=30, dob=date(1990, 1, 1))
    print(f"Created visitor: {username}")
else:
    print(f"Visitor {username} already exists")
