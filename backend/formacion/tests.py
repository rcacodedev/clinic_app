from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Formacion
from datetime import date, time

class FormacionAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')

        # Obtener el token JWT
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertEqual(response.status_code, 200)
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        # Crear una formación
        self.formacion = Formacion.objects.create(
            user=self.user,
            titulo='Curso A',
            profesional='Prof. X',
            lugar='Lugar A',
            tematica='Tema A',
            fecha_inicio=date(2023, 1, 1),
            fecha_fin=date(2023, 1, 10),
            hora=time(10, 0)
        )

    def test_listar_formaciones(self):
        response = self.client.get(reverse('formacion-list-create'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_crear_formacion(self):
        data = {
            'titulo': 'Curso B',
            'profesional': 'Prof. Y',
            'lugar': 'Lugar B',
            'tematica': 'Tema B',
            'fecha_inicio': '2023-02-01',
            'fecha_fin': '2023-02-05',
            'hora': '09:00:00'
        }
        response = self.client.post(reverse('formacion-list-create'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_obtener_detalle(self):
        response = self.client.get(reverse('formacion-detail', args=[self.formacion.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_actualizar_formacion(self):
        data = {'titulo': 'Curso A Modificado'}
        response = self.client.patch(reverse('formacion-detail', args=[self.formacion.id]), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.formacion.refresh_from_db()
        self.assertEqual(self.formacion.titulo, 'Curso A Modificado')

    def test_eliminar_formacion(self):
        response = self.client.delete(reverse('formacion-detail', args=[self.formacion.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_usuario_no_puede_ver_formacion_de_otros(self):
        otro_usuario = User.objects.create_user(username='otro', password='pass123')
        formacion_otro = Formacion.objects.create(
            user=otro_usuario,
            titulo='Curso Privado',
            profesional='Otro Prof.',
            fecha_inicio=date(2023, 5, 1),
            fecha_fin=date(2023, 5, 5),
            hora=time(8, 0)
        )
        response = self.client.get(reverse('formacion-detail', args=[formacion_otro.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
