from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User, Group
from actividades.models import Activity
from patients.models import Paciente
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import time, date

class ActivityTests(APITestCase):

    def setUp(self):
        # Crear grupo Admin
        self.admin_group = Group.objects.create(name='Admin')

        # Crear usuarios
        self.admin_user = User.objects.create_user(username='admin', password='admin123')
        self.admin_user.groups.add(self.admin_group)

        self.regular_user = User.objects.create_user(username='worker', password='worker123')

        grupo = Group.objects.create(name='Test Group')

        # Crear pacientes
        self.patient = Paciente.objects.create(
            nombre='Juan',
            primer_apellido='Pérez',
            segundo_apellido='Gómez',
            fecha_nacimiento=date(1990, 1, 1),
            dni='12345678A',
            email='juan@example.com',
            phone='123456789',
            address='Calle Falsa 123',
            city='Madrid',
            code_postal='28001',
            country='España',
            grupo=grupo
        )

        # JWT tokens
        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.user_token = str(RefreshToken.for_user(self.regular_user).access_token)

        # Cliente autenticado como admin
        self.admin_client = APIClient()
        self.admin_client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.admin_token)

        # Cliente autenticado como user normal
        self.user_client = APIClient()
        self.user_client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_token)

        self.activity_url = reverse('actividades:list_create_activities')

    def test_admin_can_create_activity(self):
        data = {
            'name': 'Yoga',
            'description': 'Clase de yoga matutina',
            'start_date': str(date.today()),
            'start_time': '09:00',
            'end_time': '10:00',
            'recurrence_days': ['Lunes', 'Miércoles'],
            'monitor': self.regular_user.id,
            'pacientes': [self.patient.id],
            'precio': '20.00'
        }

        response = self.admin_client.post(self.activity_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Activity.objects.count(), 1)

    def test_non_admin_cannot_create_activity(self):
        data = {
            'name': 'Pilates',
            'description': 'Clase de pilates avanzada',
            'monitor': self.admin_user.id
        }

        response = self.user_client.post(self.activity_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_activities_authenticated_user(self):
        Activity.objects.all().delete()  # Limpia la tabla por si acaso
        activity = Activity.objects.create(
            name='Zumba',
            description='Clase intensa de Zumba',
            user=self.regular_user,  # clave: asignar al user que hace la petición
            monitor=self.admin_user
        )
        activity.pacientes.add(self.patient)
        response = self.user_client.get(self.activity_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_activity_detail(self):
        activity = Activity.objects.create(
            name='Meditación',
            description='Clase de meditación',
            user=self.admin_user,
            monitor=self.regular_user
        )
        activity.pacientes.add(self.patient)

        url = reverse('actividades:retrieve_update_destroy_activity', args=[activity.id])
        response = self.admin_client.get(url)  # usa admin_client para acceder
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Meditación')


    def test_get_activity_detail_without_monitor(self):
        activity = Activity.objects.create(
            name='Sin monitor',
            description='Clase sin monitor asignado',
            user=self.admin_user
        )
        activity.pacientes.add(self.patient)

        url = reverse('actividades:retrieve_update_destroy_activity', args=[activity.id])
        response = self.user_client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_update_activity(self):
        activity = Activity.objects.create(
            name='Pilates Básico',
            description='Clase básica de pilates',
            user=self.admin_user,
            monitor=self.regular_user,
            start_time=time(9, 0),      # añade campos necesarios
            end_time=time(10, 0)
        )
        activity.pacientes.add(self.patient)

        url = reverse('actividades:retrieve_update_destroy_activity', args=[activity.id])
        data = {'name': 'Pilates Avanzado'}  # opcional: añade start_time y end_time para evitar error

        response = self.admin_client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Pilates Avanzado')

    def test_non_admin_cannot_update_activity(self):
        activity = Activity.objects.create(
            name='Ciclismo',
            description='Clase de ciclismo indoor',
            user=self.admin_user,
            monitor=self.regular_user
        )
        activity.pacientes.add(self.patient)

        url = reverse('actividades:retrieve_update_destroy_activity', args=[activity.id])
        data = {'name': 'Ciclismo Pro'}

        response = self.user_client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_activity(self):
        activity = Activity.objects.create(
            name='Boxeo',
            description='Clase de boxeo',
            user=self.admin_user,
            monitor=self.regular_user
        )
        url = reverse('actividades:retrieve_update_destroy_activity', args=[activity.id])

        response = self.admin_client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Activity.objects.count(), 0)

    def test_non_admin_cannot_delete_activity(self):
        activity = Activity.objects.create(
            name='Cardio',
            description='Clase de cardio',
            user=self.admin_user,
            monitor=self.regular_user
        )
        url = reverse('actividades:retrieve_update_destroy_activity', args=[activity.id])

        response = self.user_client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
