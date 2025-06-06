from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User, Group
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Factura, ConfiguracionFactura
from citas.models import Cita
from patients.models import Paciente
from workers.models import Worker
from userinfo.models import UserInfo
import tempfile
from datetime import date, time

class FacturaAPITestCase(APITestCase):

    def setUp(self):
        # Crear grupos
        self.group_fisio = Group.objects.create(name="Fisioterapia")
        self.group_admin = Group.objects.create(name="Admin")

        # Crear usuarios
        self.user_fisio = User.objects.create_user(username="fisio", password="pass1234")
        self.user_fisio.groups.add(self.group_fisio)

        self.user_admin = User.objects.create_user(username="admin", password="pass1234")
        self.user_admin.groups.add(self.group_admin)

        # Usuario que es Admin y está en Fisioterapia (necesario para el test)
        self.user_admin_fisio = User.objects.create_user(username="admin_fisio", password="pass1234")
        self.user_admin_fisio.groups.add(self.group_admin)
        self.user_admin_fisio.groups.add(self.group_fisio)

        # Crear UserInfo para usuarios
        UserInfo.objects.get_or_create(user=self.user_fisio, defaults={
            "nombre": "Fisio",
            "primer_apellido": "User"
        })

        UserInfo.objects.get_or_create(user=self.user_admin, defaults={
            "nombre": "Admin",
            "primer_apellido": "User"
        })

        UserInfo.objects.get_or_create(user=self.user_admin_fisio, defaults={
            "nombre": "AdminFisio",
            "primer_apellido": "User"
        })

        # Crear Paciente necesario para Cita
        self.paciente = Paciente.objects.create(
            nombre="Paciente1",
            primer_apellido="Apellido1",
            segundo_apellido="Apellido2",
            email="paciente1@example.com",
            phone="123456789",
            fecha_nacimiento=date(1990, 1, 1),
            dni="12345678A",
            address="Calle Falsa 123",
            city="Ciudad",
            code_postal="28080",
            country="España",
        )

        # Usuarios para el worker
        user = User.objects.create_user(username='usuario1', password='pass')
        creator = User.objects.create_user(username='admin1', password='pass')

        # Crear Worker necesario para Cita
        self.worker = Worker.objects.create(
            user=user,
            created_by=creator,
        )

        # Crear cita válida
        self.cita = Cita.objects.create(
            paciente=self.paciente,
            user=self.user_fisio,
            fecha=date.today(),
            comenzar=time(10, 0),
            finalizar=time(11, 0),
            descripcion="Descripción cita",
            worker=self.worker,
            precio=100,
            cotizada=True,
            irpf=False,
            metodo_pago='efectivo',
            pagado=True,
        )

        # Crear ConfiguracionFactura inicial
        self.config = ConfiguracionFactura.objects.create(numero_inicial=1000)

        # Preparar cliente API con token JWT (usuario fisioterapia)
        self.client = APIClient()
        refresh = RefreshToken.for_user(self.user_fisio)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_list_facturas(self):
        url = reverse("factura-list-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_factura_sin_cita(self):
        url = reverse("factura-list-create")
        data = {}  # No paso cita
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_factura_con_cita(self):
        url = reverse("factura-list-create")
        data = {"cita": self.cita.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue("id" in response.data[0])

    def test_obtener_pdf_factura(self):
        factura = Factura.objects.create(
            cita=self.cita,
            numero_factura="1001",
            total=100,
            usuario=self.user_fisio,
        )
        factura.pdf.save("test.pdf", tempfile.NamedTemporaryFile(suffix=".pdf"))
        factura.save()

        url = reverse("factura-pdf", args=[factura.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_eliminar_factura(self):
        factura = Factura.objects.create(
            cita=self.cita,
            numero_factura="1002",
            total=100,
            usuario=self.user_fisio,
        )
        url = reverse("factura-pdf", args=[factura.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Factura.objects.filter(id=factura.id).exists())

    def test_facturas_por_paciente(self):
        Factura.objects.create(
            cita=self.cita,
            numero_factura="1003",
            total=100,
            usuario=self.user_fisio,
        )
        url = reverse("facturas-por-paciente", kwargs={"paciente_id": self.paciente.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_configuracion_factura_retrieve_update(self):
        url = reverse("configuracion-factura")
        # GET configuración
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("numero_inicial", response.data)

        # PUT actualizar configuración
        data = {"numero_inicial": 2000}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["numero_inicial"], 2000)
