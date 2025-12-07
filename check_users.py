
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.getcwd())
django.setup()

from django.contrib.auth.models import User

print(f"Connected Database: {django.db.connection.settings_dict['NAME']}")

users = User.objects.all()
print(f"User Count: {users.count()}")
for u in users:
    print(f"- {u.username} (Superuser: {u.is_superuser})")
