import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'queue_backend.settings')
django.setup()

from api.models import Service, Provider

print("Checking Services...")
for s in Service.objects.all():
    print(f"Service {s.id}: {s.name}, provider_id={s.provider_id}")
    # Check if provider exists
    if s.provider_id:
        try:
            p = Provider.objects.get(id=s.provider_id)
            print(f"  -> Provider found: {p.name}")
        except Provider.DoesNotExist:
            print(f"  -> Provider {s.provider_id} DOES NOT EXIST! Deleting service...")
            s.delete() 
    else:
        print("  -> No provider (None)")
