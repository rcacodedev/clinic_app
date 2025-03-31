from django.db import models
from django.contrib.auth.models import Group

class Patient(models.Model):
    nombre = models.CharField(max_length=100)
    primer_apellido = models.CharField(max_length=100)
    segundo_apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
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
    patologias = models.JSONField(default=list)
    notas = models.TextField(blank=True, null=True)
    pdf_firmado_general = models.FileField(upload_to='pdf_PD_firmados/', blank=True, null=True)
    pdf_firmado_menor = models.FileField(upload_to='pdf_CM_firmados/', blank=True, null=True)
    pdf_firmado_inyecciones = models.FileField(upload_to='pdf_MI_firmados/', blank=True, null=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='patients', null=True)


    class Meta:
        ordering = ['-created_at']  # Últimos pacientes primero

    def __str__(self):
        return f"{self.nombre} {self.primer_apellido} {self.segundo_apellido}"

class PatientDocument(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to='patient_documents/')
    upload_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Documento de {self.patient.nombre} {self.patient.primer_apellido}"