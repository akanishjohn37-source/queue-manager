from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Provider, Service, Token

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with mock data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating mock data...')

        # 1. Create Users
        # Admin
        admin_user, created = User.objects.get_or_create(username='admin', email='admin@example.com')
        if created:
            admin_user.set_password('admin123')
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created Superuser: admin / admin123'))
        else:
            self.stdout.write('Superuser "admin" already exists')

        # Service Provider 1 (General Hospital)
        doc1, created = User.objects.get_or_create(username='doctor_general', email='doc1@example.com')
        if created:
            doc1.set_password('doc123')
            doc1.save()
            self.stdout.write(self.style.SUCCESS('Created Provider User: doctor_general / doc123'))

        # Service Provider 2 (City Clinic)
        doc2, created = User.objects.get_or_create(username='doctor_city', email='doc2@example.com')
        if created:
            doc2.set_password('doc123')
            doc2.save()
            self.stdout.write(self.style.SUCCESS('Created Provider User: doctor_city / doc123'))

        # Regular User
        user1, created = User.objects.get_or_create(username='john_doe', email='john@example.com')
        if created:
            user1.set_password('user123')
            user1.save()
            self.stdout.write(self.style.SUCCESS('Created Regular User: john_doe / user123'))

        # 2. Create Providers (Hospitals)
        hospital_a, created = Provider.objects.get_or_create(
            name='General Hospital',
            defaults={'location': '123 Main St, New York', 'admin': doc1}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Hospital: {hospital_a.name}'))

        hospital_b, created = Provider.objects.get_or_create(
            name='City Care Clinic',
            defaults={'location': '456 Park Ave, London', 'admin': doc2}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Hospital: {hospital_b.name}'))

        # 3. Create Services
        # Services for General Hospital
        s1, _ = Service.objects.get_or_create(
            name='Cardiology',
            provider=hospital_a,
            defaults={'description': 'Heart related checkups', 'status': 'Active'}
        )
        s2, _ = Service.objects.get_or_create(
            name='General Medicine',
            provider=hospital_a,
            defaults={'description': 'General physician consultation', 'status': 'Active'}
        )
        
        # Services for City Clinic
        s3, _ = Service.objects.get_or_create(
            name='Pediatrics',
            provider=hospital_b,
            defaults={'description': 'Child care specialists', 'status': 'Active'}
        )
        s4, _ = Service.objects.get_or_create(
            name='Dermatology',
            provider=hospital_b,
            defaults={'description': 'Skin care', 'status': 'Active'}
        )
        self.stdout.write(self.style.SUCCESS('Created Services: Cardiology, General Medicine, Pediatrics, Dermatology'))

        # 4. Create some initial Tokens
        # Tokens for Cardiology
        if not Token.objects.filter(service=s1).exists():
            Token.objects.create(token_number=1, service=s1, visitor_name="Alice Smith", status="calling")
            Token.objects.create(token_number=2, service=s1, visitor_name="Bob Jones", status="waiting")
            Token.objects.create(token_number=3, service=s1, visitor_name="Charlie Brown", status="waiting")
            self.stdout.write(self.style.SUCCESS('Added 3 tokens to Cardiology'))

        # Tokens for Pediatrics
        if not Token.objects.filter(service=s3).exists():
            Token.objects.create(token_number=1, service=s3, visitor_name="Baby Doe", status="completed")
            Token.objects.create(token_number=2, service=s3, visitor_name="Kid Rock", status="waiting")
            self.stdout.write(self.style.SUCCESS('Added 2 tokens to Pediatrics'))

        self.stdout.write(self.style.SUCCESS('Mock data population complete!'))
