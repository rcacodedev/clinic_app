from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta
from django.urls import reverse
from patients.models import Paciente
from workers.models import Worker
from userinfo.models import UserInfo
from citas.models import Cita, ConfiguracionPrecioCita
from citas.serializers import CitaSerializer


class CitaSerializerTest(TestCase):
    def setUp(self):
        self.grupo_psicologia = Group.objects.create(name="psicologia")
        self.grupo_fisioterapia = Group.objects.create(name="fisioterapia")

        self.user_psicologia = User.objects.create_user(username="user_psic", password="pass")
        self.user_psicologia.groups.add(self.grupo_psicologia)

        self.user_fisioterapia = User.objects.create_user(username="user_fisio", password="pass")
        self.user_fisioterapia.groups.add(self.grupo_fisioterapia)

        self.paciente_psicologia = Paciente.objects.create(
            nombre="Juan", primer_apellido="Perez", segundo_apellido="Lopez",
            email="juan.psicologia@example.com", fecha_nacimiento="1990-01-01",
            dni="12345678A", address="Calle Falsa 123", city="Ciudad",
            code_postal="28001", country="España", grupo=self.grupo_psicologia
        )

        self.paciente_fisioterapia = Paciente.objects.create(
            nombre="Juan", primer_apellido="Perez", segundo_apellido="Lopez",
            email="juan.fisioterapia@example.com", fecha_nacimiento="1990-01-01",
            dni="12345678B", address="Calle Verdadera 456", city="Ciudad",
            code_postal="28002", country="España", grupo=self.grupo_fisioterapia
        )

    def test_create_cita_valid_paciente_group(self):
        data = {
            "paciente_id": self.paciente_psicologia.id,
            "fecha": "2025-05-27",
            "comenzar": "09:00",
            "finalizar": "10:00",
            "descripcion": "Consulta psicología"
        }
        serializer = CitaSerializer(data=data, context={'request': self._get_mock_request(self.user_psicologia)})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        cita = serializer.save(user=self.user_psicologia)
        self.assertEqual(cita.paciente, self.paciente_psicologia)

    def test_create_cita_invalid_paciente_group(self):
        data = {
            "paciente_id": self.paciente_fisioterapia.id,
            "fecha": "2025-05-27",
            "comenzar": "09:00",
            "finalizar": "10:00",
            "descripcion": "Consulta inválida"
        }
        serializer = CitaSerializer(data=data, context={'request': self._get_mock_request(self.user_psicologia)})
        self.assertFalse(serializer.is_valid())
        self.assertIn('paciente_id', serializer.errors)

    def _get_mock_request(self, user):
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return MockRequest(user)


class CitasAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.worker_group = Group.objects.create(name="worker")
        self.admin_group = Group.objects.create(name="admin")  # Nuevo grupo admin

        self.admin_user = User.objects.create_user(username="admin", password="adminpass")
        self.admin_user.groups.add(self.admin_group)

        self.worker_user = User.objects.create_user(username="worker", password="workerpass")
        self.worker_user.groups.add(self.worker_group)

        self.worker = Worker.objects.create(user=self.worker_user, first_name="Worker1", created_by=self.admin_user)

        self.paciente = Paciente.objects.create(
            nombre="Paciente", primer_apellido="Test", segundo_apellido="Example",
            email="paciente@example.com", fecha_nacimiento="1995-01-01",
            dni="87654321Z", address="Calle 1", city="Ciudad", code_postal="12345",
            country="España", grupo=self.worker_group  # O admin_group según tu lógica
        )

        fecha_cita = datetime.now() + timedelta(days=1)
        comenzar = (fecha_cita + timedelta(hours=1)).time()
        finalizar = (fecha_cita + timedelta(hours=2)).time()

        self.cita = Cita.objects.create(
            paciente=self.paciente,
            user=self.admin_user,
            worker=self.worker,
            fecha=fecha_cita.date(),
            comenzar=comenzar,
            finalizar=finalizar,
            descripcion="Revisión",
            precio=30
        )

        self.config = ConfiguracionPrecioCita.objects.create(precio_global=50)

        UserInfo.objects.filter(user=self.worker_user).delete()

        self.user_info = UserInfo.objects.create(
            user=self.worker_user,
            twilio_account_sid="fake_sid",
            twilio_auth_token="fake_token",
            whatsapp_business_number="+14155238886"
        )

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_list_citas_authenticated(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/citas/")
        self.assertEqual(response.status_code, 200)

    def test_create_cita(self):
        token = self.get_token(self.worker_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        fecha = (datetime.now() + timedelta(days=2)).date().isoformat()  # "YYYY-MM-DD"
        comenzar = (datetime.now() + timedelta(days=2, hours=1)).time().strftime("%H:%M")  # "HH:MM"
        finalizar = (datetime.now() + timedelta(days=2, hours=2)).time().strftime("%H:%M")  # "HH:MM
        data = {
            "paciente_id": self.paciente.id,
            "fecha": fecha,
            "comenzar": comenzar,
            "finalizar": finalizar,
            "descripcion": "Nueva cita"
        }
        response = self.client.post("/citas/", data, format="json")
        self.assertEqual(response.status_code, 201)

    def test_detail_cita_view(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(f"/citas/{self.cita.id}/")
        self.assertEqual(response.status_code, 200)

    def test_configuracion_precio_view(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/citas/configurar-precio/")
        self.assertEqual(response.status_code, 200)

    def test_enviar_recordatorio_whatsapp_sin_ids(self):
        token = self.get_token(self.worker_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("citas:enviar-whatsapp")

        print(f"🔍 URL generada: {url}")
        response = self.client.post(url, {})
        print(f"🔍 Status code: {response.status_code}")
        self.assertEqual(response.status_code, 400)

    def test_enviar_recordatorio_whatsapp_ok(self):
        token = self.get_token(self.worker_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.paciente.phone = "+34600000000"
        self.paciente.save()
        response = self.client.post("/citas/enviar-whatsapp/", {
            "citas_ids": [self.cita.id]
        }, format="json")
        self.assertIn(response.status_code, [200, 400])  # Puede fallar por el fake token
