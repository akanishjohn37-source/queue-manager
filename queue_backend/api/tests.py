from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Service, Token

User = get_user_model()

class AuthTests(APITestCase):
    def test_register_user(self):
        url = reverse('register')  # Ensure you have a named URL 'register'
        data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'password2': 'testpassword123',
            'email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('token' in response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_register_duplicate_user(self):
        url = reverse('register')
        data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'password2': 'testpassword123',
            'email': 'test@example.com'
        }
        self.client.post(url, data) # First registration
        response = self.client.post(url, data) # Duplicate registration
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_login_user(self):
        # Create user first
        User.objects.create_user(username='testuser', password='testpassword123')
        
        url = reverse('login')  # Ensure you have a named URL 'login'
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

class ServiceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.force_authenticate(user=self.user)
        # Create a provider for this user
        from .models import Provider
        self.provider = Provider.objects.create(name="Test Hospital", admin=self.user)
        self.service_url = '/api/services/' # Assuming router generates this

    def test_create_service(self):
        data = {'name': 'General Inquiry', 'description': 'General questions'}
        response = self.client.post(self.service_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.count(), 1)
        self.assertEqual(Service.objects.get().name, 'General Inquiry')

    def test_list_services(self):
        Service.objects.create(name='Service 1')
        Service.objects.create(name='Service 2')
        response = self.client.get(self.service_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_services_unauthenticated(self):
        self.client.logout()
        Service.objects.create(name='Public Service')
        response = self.client.get(self.service_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class TokenTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.force_authenticate(user=self.user)
        self.service = Service.objects.create(name='Test Service')
        self.token_url = '/api/tokens/' # Assuming router

    def test_create_token(self):
        data = {'service': self.service.id}
        response = self.client.post(self.token_url, data, format='json')
        if response.status_code != 201:
            print(f"Create Token Error: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Token.objects.count(), 1)
        self.assertEqual(Token.objects.get().token_number, 1)

    def test_token_auto_increment(self):
        # Create first token
        Token.objects.create(service=self.service, token_number=1, status='waiting')
        
        # Create second token via API
        data = {'service': self.service.id}
        response = self.client.post(self.token_url, data, format='json')
        if response.status_code != 201:
            print(f"Auto Increment Error: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['token_number'], 2)

    def test_update_token_status(self):
        # Create a token
        token = Token.objects.create(service=self.service, token_number=1, status='waiting')
        url = f'/api/tokens/{token.id}/'
        
        # Try to update status
        data = {'status': 'called'}
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token.refresh_from_db()
        self.assertEqual(token.status, 'called')
