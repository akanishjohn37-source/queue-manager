import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from queue_backend.api.models import Provider, Service

def restore_services():
    services_map = {
        "General Hospital": ["Cardiology", "Neurology", "General Medicine"],
        "City Care Clinic": ["Pediatrics", "Dermatology", "ENT"],
    }

    for hospital_name, service_names in services_map.items():
        try:
            provider = Provider.objects.get(name=hospital_name)
            for s_name in service_names:
                service, created = Service.objects.get_or_create(
                    name=s_name,
                    provider=provider
                )
                if created:
                    print(f"Created Service: {s_name} for {hospital_name}")
                else:
                    print(f"Service exists: {s_name} for {hospital_name}")
        except Provider.DoesNotExist:
            print(f"Provider not found: {hospital_name}")

if __name__ == "__main__":
    restore_services()
