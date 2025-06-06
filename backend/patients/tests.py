from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import Group
from django.contrib.auth.models import User
from .models import Paciente
from .models import PacienteDocumentacion
from datetime import date

class PacienteModelTest(TestCase):
    def setUp(self):
        self.grupo = Group.objects.create(name="Fisioterapia")

    def test_subida_pdf_firmado_general(self):
        # Crear archivo PDF falso
        fake_pdf = SimpleUploadedFile(
            "consentimiento.pdf",
            b"%PDF-1.4 contenido falso del PDF",
            content_type="application/pdf"
        )

        paciente = Paciente.objects.create(
            nombre="Ana",
            primer_apellido="López",
            segundo_apellido="Martínez",
            email="ana@example.com",
            phone="666666666",
            fecha_nacimiento=date(1990, 1, 1),
            dni="12345678Z",
            address="Calle Salud 12",
            city="Madrid",
            code_postal="28001",
            country="España",
            pdf_firmado_general=fake_pdf,
            grupo=self.grupo,
        )

        self.assertTrue(paciente.pdf_firmado_general.name.endswith("consentimiento.pdf"))
        self.assertIn("pdf_PD_firmados", paciente.pdf_firmado_general.name)
        self.assertIn(str(paciente.uuid), paciente.pdf_firmado_general.name)

class PacienteDocumentacionModelTest(TestCase):
    def setUp(self):
        self.grupo = Group.objects.create(name="Psicología")
        self.paciente = Paciente.objects.create(
            nombre="Carlos",
            primer_apellido="Sánchez",
            segundo_apellido="Ruiz",
            email="carlos@example.com",
            phone="655555555",
            fecha_nacimiento=date(1985, 5, 20),
            dni="87654321B",
            address="Calle Paz 45",
            city="Sevilla",
            code_postal="41001",
            country="España",
            grupo=self.grupo,
        )

    def test_subida_archivo_paciente_documentacion(self):
        # Crear archivo PDF falso
        fake_doc = SimpleUploadedFile(
            "receta_medica.pdf",
            b"%PDF-1.4 contenido de receta",
            content_type="application/pdf"
        )

        doc = PacienteDocumentacion.objects.create(
            paciente=self.paciente,
            archivo=fake_doc
        )

        self.assertTrue(doc.archivo.name.endswith("receta_medica.pdf"))
        self.assertIn("documentos", doc.archivo.name)
        self.assertIn(str(self.paciente.uuid), doc.archivo.name)

class PacienteViewsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.group = Group.objects.create(name='Fisioterapia')
        self.user.groups.add(self.group)

        self.client = APIClient()

        # Generar token JWT para el usuario
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        # Establecer el token en el header de autenticación para todas las peticiones
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Crear un paciente para pruebas
        self.paciente = Paciente.objects.create(
            nombre="Laura",
            primer_apellido="Pérez",
            segundo_apellido="Gómez",
            email="laura@example.com",
            phone="600000000",
            fecha_nacimiento="1990-01-01",
            dni="11111111A",
            address="Calle Sol 10",
            city="Valencia",
            code_postal="46001",
            country="España",
            grupo=self.group
        )

    def test_list_pacientes(self):
        response = self.client.get('/pacientes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_paciente(self):
        data = {
            "nombre": "Mario",
            "primer_apellido": "López",
            "segundo_apellido": "Sanz",
            "email": "mario@example.com",
            "phone": "611111111",
            "fecha_nacimiento": "1980-12-12",
            "dni": "22222222B",
            "address": "Calle Luna 1",
            "city": "Granada",
            "code_postal": "18001",
            "country": "España"
        }
        response = self.client.post('/pacientes/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nombre"], "Mario")

    def test_retrieve_update_delete_paciente(self):
        url = f'/pacientes/{self.paciente.pk}/'

        # Retrieve
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Update
        response = self.client.patch(url, {"phone": "699999999"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone"], "699999999")

        # Delete
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_upload_pdf_firmado_general(self):
        pdf = SimpleUploadedFile(
            "paciente_LPD.pdf", b"%PDF-1.4 archivo falso", content_type="application/pdf"
        )
        url = f'/pacientes/{self.paciente.pk}/upload-signed-pdf/'
        data = {'pdf_firmado_general': pdf}

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pdf_firmado_general", response.data["pdf_urls"])

    def test_upload_documento_paciente(self):
        pdf = SimpleUploadedFile(
            "doc_test.pdf", b"%PDF-1.4 archivo doc", content_type="application/pdf"
        )
        url = f'/pacientes/documentos/?patient_id={self.paciente.pk}'
        data = {
            'archivo': pdf
        }

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("archivo", response.data)

    def test_list_documentos_por_paciente(self):
        # Crear documento
        PacienteDocumentacion.objects.create(paciente=self.paciente, archivo=SimpleUploadedFile(
            "doc.pdf", b"%PDF-1.4", content_type="application/pdf"
        ))

        url = f'/pacientes/documentos/?patient_id={self.paciente.pk}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_eliminar_documento_paciente(self):
        documento = PacienteDocumentacion.objects.create(
            paciente=self.paciente,
            archivo=SimpleUploadedFile("temp.pdf", b"%PDF-1.4", content_type="application/pdf")
        )

        url = f'/pacientes/documentos/{documento.pk}/eliminar/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


    def test_editar_paciente(self):
        url = f'/pacientes/{self.paciente.pk}/'

        data_actualizada = {
            "nombre": "Laura Editada",
            "email": "nueva_laura@example.com",
            "city": "Alicante"
        }

        response = self.client.patch(url, data_actualizada, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nombre"], "Laura Editada")
        self.assertEqual(response.data["email"], "nueva_laura@example.com")
        self.assertEqual(response.data["city"], "Alicante")
