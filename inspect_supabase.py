from django.db import connection
from django.conf import settings

def check_db():
    print(f"Checking database: {settings.DATABASES['default']['NAME']} on {settings.DATABASES['default']['HOST']}")
    with connection.cursor() as cursor:
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'api_userprofile'")
        columns = cursor.fetchall()
        if not columns:
            print("Table 'api_userprofile' not found!")
        else:
            print("Columns in 'api_userprofile':")
            for col in columns:
                print(f" - {col[0]} ({col[1]})")

if __name__ == "__main__":
    import os
    import django
    # Assuming the project settings are correctly set in the environment or manage.py setting
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    check_db()
