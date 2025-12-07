
import sys
import os
import django
from django.conf import settings

# Setup environment like manage.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.getcwd()) # Ensure current dir is in path

try:
    print(f"Current Path: {os.getcwd()}")
    print("Attempting to import queue_backend...")
    import queue_backend
    print("SUCCESS: Imported queue_backend")
    
    print("Attempting to import queue_backend.api...")
    import queue_backend.api
    print("SUCCESS: Imported queue_backend.api")

    print("Attempting to import queue_backend.api.apps...")
    from queue_backend.api import apps
    print(f"SUCCESS: Imported apps. ApiConfig.name = '{apps.ApiConfig.name}'")

    print("Attempting Django Setup...")
    django.setup()
    print("SUCCESS: Django Setup Complete")

except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
