from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
import tempfile
from PIL import Image

class UserInfoTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123', email='test@example.com'
        )
        self.user_info = self.user.userInfo  # Ya está creado automáticamente por la señal

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def authenticate(self):
        self.client.login(username='testuser', password='testpass123')

    def test_user_info_detail_view(self):
        self.authenticate()
        url = reverse('user_info_detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_user_info_update_view(self):
        self.authenticate()
        url = reverse('user_info_update')
        response = self.client.patch(url, {
            'phone': '987654321',
            'city': 'Nueva Ciudad',
            'user': {'first_name': 'NuevoNombre'}
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_info.refresh_from_db()
        self.user.refresh_from_db()
        self.assertEqual(self.user_info.phone, '987654321')
        self.assertEqual(self.user_info.city, 'Nueva Ciudad')
        self.assertEqual(self.user.first_name, 'NuevoNombre')

    def test_user_info_update_photo_view(self):
        self.authenticate()
        url = reverse('user_info_update_photo')

        # Crear una imagen temporal
        image = Image.new('RGB', (100, 100))
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
        image.save(tmp_file, format='JPEG')
        tmp_file.seek(0)

        photo_file = SimpleUploadedFile('test.jpg', tmp_file.read(), content_type='image/jpeg')
        response = self.client.patch(url, {'photo': photo_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_info.refresh_from_db()
        self.assertIn('foto_perfil', self.user_info.photo.name)
