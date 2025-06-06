from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User, Group
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core import mail

class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # Crear un grupo para pruebas
        self.group = Group.objects.create(name='testgroup')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Testpass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'group': 'testgroup'
        }

    def test_create_user(self):
        url = reverse('create_user')  # Asegúrate que la URL se llame así en urls.py
        response = self.client.post(url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)

        user = User.objects.get(username='testuser')
        self.assertTrue(user.check_password('Testpass123!'))
        self.assertTrue(user.groups.filter(name='testgroup').exists())

    def test_login(self):
        # Crear usuario manualmente para login
        user = User.objects.create_user(username='loginuser', password='Loginpass123!')
        url = reverse('token_obtain_pair')  # URL del token
        response = self.client.post(url, {'username': 'loginuser', 'password': 'Loginpass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_change_password(self):
        user = User.objects.create_user(username='changepassuser', password='Oldpass123!')
        self.client.force_authenticate(user=user)

        url = reverse('change_password')  # Asegúrate que la URL se llame así
        data = {
            'current_password': 'Oldpass123!',
            'new_password': 'Newpass123!',
            'confirm_password': 'Newpass123!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.check_password('Newpass123!'))

    def test_create_user_without_group(self):
        user_data = self.user_data.copy()
        user_data.pop('group')
        url = reverse('create_user')
        response = self.client.post(url, user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username=user_data['username'])
        self.assertEqual(user.groups.count(), 0)

    def test_create_user_with_invalid_group(self):
        user_data = self.user_data.copy()
        user_data['group'] = 'nonexistentgroup'
        url = reverse('create_user')
        response = self.client.post(url, user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_invalid_credentials(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'wrong', 'password': 'wrongpass'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_wrong_current(self):
        user = User.objects.create_user(username='user2', password='Oldpass123!')
        self.client.force_authenticate(user=user)
        url = reverse('change_password')
        data = {
            'current_password': 'WrongPass!',
            'new_password': 'Newpass123!',
            'confirm_password': 'Newpass123!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_contains_custom_claims(self):
        user = User.objects.create_user(username='tokenuser', password='Tokenpass123!')
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'tokenuser', 'password': 'Tokenpass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Decodificar token si quieres, o verificar que exista campo
        access_token = response.data['access']
        # Aquí podrías usar PyJWT para decodificar y validar claims

    def test_password_reset_request_valid_email(self):
        user = User.objects.create_user(username='resetuser', email='reset@example.com', password='Resetpass123!')
        url = reverse('password_reset_request')
        data = {
            'email': 'reset@example.com',
            'frontend_base_url': 'http://localhost:3000'
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Restablece tu contraseña', mail.outbox[0].subject)
        self.assertIn('resetuser', mail.outbox[0].alternatives[0][0])  # Asegura que el nombre del usuario esté en el correo

    def test_password_reset_request_invalid_email(self):
        url = reverse('password_reset_request')
        data = {
            'email': 'nonexistent@example.com',
            'frontend_base_url': 'http://localhost:3000'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Usuario no encontrado.')

    def test_password_reset_confirm_valid(self):
        user = User.objects.create_user(username='confirmuser', email='confirm@example.com', password='Oldpass123!')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        url = reverse('password_reset_confirm')
        data = {
            'uid': uid,
            'token': token,
            'new_password': 'Newpass456!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('Newpass456!'))

    def test_password_reset_confirm_invalid_token(self):
        user = User.objects.create_user(username='invalidtokenuser', email='inv@example.com', password='Oldpass123!')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        invalid_token = 'invalid-token'

        url = reverse('password_reset_confirm')
        data = {
            'uid': uid,
            'token': invalid_token,
            'new_password': 'Newpass456!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Token inválido o expirado.')