import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
password = 'admin123'
email = 'admin@example.com'

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser: {username}")
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superuser created successfully.")
else:
    print(f"Superuser '{username}' already exists. Resetting password.")
    u = User.objects.get(username=username)
    u.set_password(password)
    u.save()
    print("Password updated.")
