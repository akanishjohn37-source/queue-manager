import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from queue_backend.api.models import Provider

def restore_hospitals():
    admin_user = User.objects.filter(username='admin').first()
    if not admin_user:
        print("Admin user not found.")
        return

    hospitals = [
        {"name": "General Hospital", "location": "123 Main St, New York"},
        {"name": "City Care Clinic", "location": "456 Park Ave, London"},
    ]

    for h in hospitals:
        p, created = Provider.objects.get_or_create(
            name=h["name"],
            defaults={
                "location": h["location"],
                "admin": admin_user  # Assign to current admin for visibility/control
            }
        )
        if created:
            print(f"Restored: {p.name}")
        else:
            print(f"Exists: {p.name}")

if __name__ == "__main__":
    restore_hospitals()
