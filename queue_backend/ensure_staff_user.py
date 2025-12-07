import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'queue_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Provider, Service, ServiceStaff

User = get_user_model()

def create_staff():
    # 1. Ensure Admin exists
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@example.com", "password123")
        print("Created superuser 'admin'")

    admin_user = User.objects.get(username="admin")

    # 2. Ensure Provider (Hospital) exists
    hospital, _ = Provider.objects.get_or_create(
        name="City General Hospital",
        defaults={"location": "Downtown", "admin": admin_user}
    )
    print(f"Ensured Hospital: {hospital.name}")

    # 3. Ensure Service exists
    service, _ = Service.objects.get_or_create(
        name="Cardiology",
        provider=hospital,
        defaults={"description": "Heart stuff"}
    )
    print(f"Ensured Service: {service.name}")

    # 4. Ensure Staff User exists
    staff_user, created = User.objects.get_or_create(username="dr_smith")
    if created:
        staff_user.set_password("password123")
        staff_user.save()
        print("Created staff user 'dr_smith'")
    else:
        # Reset password just in case
        staff_user.set_password("password123")
        staff_user.save()
        print("Reset password for 'dr_smith'")

    # 5. Link Staff to Service
    ServiceStaff.objects.update_or_create(
        user=staff_user,
        defaults={"service": service}
    )
    print(f"Linked 'dr_smith' to 'Cardiology'")

if __name__ == '__main__':
    create_staff()
