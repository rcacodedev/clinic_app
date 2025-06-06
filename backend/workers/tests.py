from django.urls import reverse
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import datetime, time, date
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError

from patients.models import Paciente
from workers.models import Worker, PDFRegistro
from workers.serializers import UserSerializer, WorkerSerializer
from citas.models import Cita


# ---------------- SERIALIZERS TEST ---------------- #

class UserSerializerTest(TestCase):
    def test_valid_user_data(self):
        data = {
            'username': 'johndoe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'secure12345',
            'confirm_password': 'secure12345'
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.username, 'johndoe')
        self.assertTrue(user.check_password('secure12345'))

    def test_password_mismatch(self):
        data = {
            'username': 'janedoe',
            'email': 'jane@example.com',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'password': 'abc123',
            'confirm_password': 'wrong123'
        }
        serializer = UserSerializer(data=data)
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)


class WorkerSerializerTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = User.objects.create_user(username='admin', password='adminpass')
        cls.group = Group.objects.create(name='Fisioterapia')

    def test_create_worker(self):
        data = {
            'user': {
                'username': 'worker1',
                'email': 'worker1@example.com',
                'first_name': 'Worker',
                'last_name': 'Uno',
                'password': 'testpass123',
                'confirm_password': 'testpass123'
            },
            'first_name': 'Worker',
            'last_name': 'Uno',
            'color': '#123456',
            'groups': [self.group.id]
        }
        fake_request = type('Request', (), {'user': self.admin_user})()
        serializer = WorkerSerializer(data=data, context={'request': fake_request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        worker = serializer.save()
        self.assertEqual(worker.created_by, self.admin_user)
        self.assertTrue(worker.user.check_password('testpass123'))
        self.assertEqual(worker.groups.first().name, 'Fisioterapia')

    def test_update_worker(self):
        user = User.objects.create_user(username='updateuser', password='pass123')
        worker = Worker.objects.create(user=user, created_by=self.admin_user, first_name='Old')
        new_group = Group.objects.create(name='Psicología')
        data = {
            'user': {
                'username': 'newuser',
                'email': 'new@example.com',
                'first_name': 'New',
                'last_name': 'Name',
                'password': 'newpass123',
                'confirm_password': 'newpass123'
            },
            'first_name': 'New',
            'last_name': 'Name',
            'color': '#abcdef',
            'groups': [new_group.id]
        }
        serializer = WorkerSerializer(instance=worker, data=data, context={'request': None})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated = serializer.save()
        self.assertEqual(updated.color, '#abcdef')
        self.assertTrue(updated.user.check_password('newpass123'))


# ---------------- API TESTS ---------------- #

class WorkerViewsTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_group = Group.objects.create(name='Admin')
        cls.fisio_group = Group.objects.create(name='Fisioterapia')
        cls.psico_group = Group.objects.create(name='Psicología')
        cls.other_group = Group.objects.create(name='Otro')

        cls.admin_user = User.objects.create_user(username='admin', password='pass123')
        cls.admin_user.groups.add(cls.admin_group, cls.fisio_group)

        cls.admin_other = User.objects.create_user(username='admin_other', password='pass123')
        cls.admin_other.groups.add(cls.admin_group, cls.other_group)

        cls.worker_user = User.objects.create_user(username='worker', password='pass123')
        cls.worker_user.groups.add(cls.other_group)

        cls.worker_created = Worker.objects.create(
            user=cls.worker_user, created_by=cls.admin_user, first_name='Worker 1'
        )
        cls.worker_created.groups.add(cls.other_group)

        cls.token_admin = str(RefreshToken.for_user(cls.admin_user).access_token)
        cls.token_admin_other = str(RefreshToken.for_user(cls.admin_other).access_token)
        cls.token_worker = str(RefreshToken.for_user(cls.worker_user).access_token)

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    def test_list_as_admin(self):
        self.auth(self.token_admin)
        res = self.client.get(reverse('worker-list-create'))
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_list_as_other_admin(self):
        self.auth(self.token_admin_other)
        res = self.client.get(reverse('worker-list-create'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data['results']), 0)

    def test_list_as_worker(self):
        self.auth(self.token_worker)
        res = self.client.get(reverse('worker-list-create'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['results'][0]['first_name'], 'Worker 1')

    def test_create_worker(self):
        self.auth(self.token_admin_other)
        data = {
            "user": {
                "username": "nuevo_worker",
                "email": "nuevo@worker.com",
                "password": "TestPassword123!",
                "confirm_password": "TestPassword123!"
            },
            "first_name": "NombreNuevo",
            "last_name": "ApellidoNuevo",
            "groups": [self.other_group.id]
        }
        res = self.client.post(reverse('worker-list-create'), data, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(Worker.objects.filter(user=self.worker_user).exists())

    def test_get_worker_detail_permissions(self):
        url = reverse('worker-detail', args=[self.worker_created.id])

        self.auth(self.token_worker)
        self.assertEqual(self.client.get(url).status_code, 200)

        self.auth(self.token_admin_other)
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_update_worker_permission(self):
        url = reverse('worker-detail', args=[self.worker_created.id])
        self.auth(self.token_admin)
        res = self.client.patch(url, {"name": "Nuevo"}, format='json')
        self.assertEqual(res.status_code, 200)

    def test_delete_worker_permission(self):
        url = reverse('worker-detail', args=[self.worker_created.id])
        self.auth(self.token_worker)
        self.assertEqual(self.client.delete(url).status_code, 403)

        self.auth(self.token_admin)
        res = self.client.delete(url)
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Worker.objects.filter(id=self.worker_created.id).exists())

    def test_appointment_list(self):
        Cita.objects.create(worker=self.worker_created, user=self.admin_user, descripcion="Cita 1", fecha=datetime.now(), comenzar=time(10,0), finalizar=time(11,0))
        url = reverse('worker-appointments-list', args=[self.worker_created.id])

        self.auth(self.token_admin)
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_appointment_create(self):
        self.auth(self.token_admin)
        url = reverse('worker-appointments-create', args=[self.worker_created.id])

        # Obtener grupo del admin (el mismo que usará el paciente)
        user_group = self.admin_user.groups.first()

        # Crear paciente válido para el test
        paciente = Paciente.objects.create(
            nombre="Juan",
            primer_apellido="Pérez",
            segundo_apellido="Gómez",
            email="juan.perez@example.com",
            phone="123456789",
            fecha_nacimiento=date(1990, 1, 1),
            dni="12345678A",
            address="Calle Falsa 123",
            city="Ciudad",
            code_postal="28080",
            country="España",
            grupo=user_group,
            alergias=False,
            patologias=[],
            notas="",
        )

        data = {
            "user": self.admin_user.id,
            "descripcion": "Nueva cita",
            "paciente_id": paciente.id,
            "fecha": "2025-05-30",
            "comenzar": "10:00:00",
            "finalizar": "11:00:00",
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(Cita.objects.filter(descripcion="Nueva cita").exists())

    def test_appointment_delete(self):
        cita = Cita.objects.create(worker=self.worker_created, user=self.admin_user, descripcion="Eliminar", fecha=datetime.now(), comenzar=time(10,0), finalizar=time(11,0))
        self.auth(self.token_admin)
        url = reverse('worker-appointment-detail', kwargs={'worker_pk': cita.worker.pk, 'pk': cita.id})
        res = self.client.delete(url)
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Cita.objects.filter(id=cita.id).exists())

    def test_get_worker_by_user(self):
        self.auth(self.token_admin)
        url = reverse('worker-by-user', args=[self.worker_user.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['id'], self.worker_created.id)

    def test_worker_id_from_user_id(self):
        self.auth(self.token_admin)
        url = reverse('worker-id-from-user-id', args=[self.worker_user.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['worker_id'], self.worker_created.id)

    def test_worker_not_found(self):
        self.auth(self.token_admin)
        url = reverse('worker-by-user', args=[9999])
        self.assertEqual(self.client.get(url).status_code, 404)
        url2 = reverse('worker-id-from-user-id', args=[9999])
        self.assertEqual(self.client.get(url2).status_code, 404)


class PDFRegistroViewsTest(APITestCase):
    def setUp(self):
        self.admin_group = Group.objects.create(name='Admin')

        self.admin_user = User.objects.create_user(username='adminpdf', password='pass123')
        self.admin_user.groups.add(self.admin_group)
        self.token = str(RefreshToken.for_user(self.admin_user).access_token)

        self.worker = Worker.objects.create(user=self.admin_user, created_by=self.admin_user, first_name='PDF')

    def test_upload_pdf(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        url = reverse('worker-pdf-upload', kwargs={'worker_pk': self.worker.pk})
        file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
        response = self.client.post(url, {"file": file}, format='multipart')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(PDFRegistro.objects.filter(worker=self.worker).exists())
        self.assertIn('file_url', response.data)

    def test_list_pdfs(self):
        # Crea un PDF subido por admin
        pdf = PDFRegistro.objects.create(
            worker=self.worker,
            file=SimpleUploadedFile("admin_test.pdf", b"admin content", content_type="application/pdf"),
            created_by=self.admin_user,
            is_admin_upload=True
        )
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        url = reverse('worker-pdf-list', kwargs={'worker_pk': self.worker.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertIn("admin_pdfs", response.data)
        self.assertEqual(len(response.data["admin_pdfs"]), 1)
        self.assertEqual(response.data["total_pages_admin"], 1)
        self.assertEqual(response.data["current_page_admin"], 1)

    def test_delete_pdf(self):
        pdf = PDFRegistro.objects.create(
            worker=self.worker,
            file=SimpleUploadedFile("delete_test.pdf", b"delete content", content_type="application/pdf"),
            created_by=self.admin_user,
            is_admin_upload=True
        )

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        url = reverse('worker-pdf-delete', kwargs={"pdf_id": pdf.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(PDFRegistro.objects.filter(id=pdf.id).exists())

    def test_delete_pdf_by_other_user_forbidden(self):
        other_user = User.objects.create_user(username='otheruser', password='otherpass')
        pdf = PDFRegistro.objects.create(
            worker=self.worker,
            file=SimpleUploadedFile("unauthorized.pdf", b"unauthorized content", content_type="application/pdf"),
            created_by=other_user,
            is_admin_upload=False
        )

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        url = reverse('worker-pdf-delete', kwargs={"pdf_id": pdf.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 403)
        self.assertIn("error", response.data)
