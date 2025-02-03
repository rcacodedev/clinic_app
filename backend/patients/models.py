from django.db import models
from django.core.validators import RegexValidator

class Patient(models.Model):
    nombre = models.CharField(max_length=100)
    primer_apellido = models.CharField(max_length=100)
    segundo_apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Número de teléfono inválido. Debe incluir el código de país.')]
    )
    fecha_nacimiento = models.DateField()
    dni = models.CharField(max_length=10)
    address = models.CharField(max_length=250)
    city = models.CharField(max_length=100)
    code_postal = models.CharField(max_length=6)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Últimos pacientes primero

    def __str__(self):
        return f"{self.nombre} {self.primer_apellido} {self.segundo_apellido}"
