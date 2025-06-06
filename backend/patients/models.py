from django.db import models
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
import uuid

def validate_pdf(file):
    if not file.name.endswith('.pdf'):
        raise ValidationError("Solo se permiten archivos PDF.")

def pdf_path(instance, filename, suffix):
    # Usa UUID para que funcione tanto antes como después de guardar
    return f"pacientes/{instance.uuid}/{suffix}/{filename}"

def upload_pdf_firmado_general(instance, filename):
    return pdf_path(instance, filename, "pdf_PD_firmados")

def upload_pdf_firmado_menor(instance, filename):
    return pdf_path(instance, filename, "pdf_CM_firmados")

def upload_pdf_firmado_inyecciones(instance, filename):
    return pdf_path(instance, filename, "pdf_MI_firmados")

def patient_doc_path(instance, filename):
    return f"pacientes/{instance.paciente.uuid}/documentos/{filename}"

class Paciente(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    nombre = models.CharField(max_length=100)
    primer_apellido = models.CharField(max_length=100)
    segundo_apellido = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
    )
    fecha_nacimiento = models.DateField()
    dni = models.CharField(max_length=10)
    address = models.CharField(max_length=250)
    city = models.CharField(max_length=100)
    code_postal = models.CharField(max_length=6)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    alergias = models.BooleanField(default=False)
    patologias = models.JSONField(default=list, blank=True, null=True)
    notas = models.TextField(blank=True, null=True)

    pdf_firmado_general = models.FileField(
        upload_to=upload_pdf_firmado_general,
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf'])]
    )
    pdf_firmado_menor = models.FileField(
        upload_to=upload_pdf_firmado_menor,
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf'])]
    )
    pdf_firmado_inyecciones = models.FileField(
        upload_to=upload_pdf_firmado_inyecciones,
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf'])]
    )

    grupo = models.ForeignKey(
        Group, on_delete=models.CASCADE,
        related_name="pacientes", null=True
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = ('grupo', 'email')  # evita duplicados dentro del mismo grupo

    def __str__(self):
        return f"{self.nombre} {self.primer_apellido} {self.segundo_apellido}"

class PacienteDocumentacion(models.Model):
    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.CASCADE,
        related_name="documentos",
        null=True,
        blank=True
    )
    archivo = models.FileField(
        upload_to=patient_doc_path,
        validators=[FileExtensionValidator(['pdf', 'jpg', 'png'])]
    )
    upload_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.paciente:
            return f"Documento de {self.paciente.nombre} {self.paciente.primer_apellido}"
        else:
            return "Documento sin paciente asignado"
