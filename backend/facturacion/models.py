from django.db import models
from django.contrib.auth.models import User
from citas.models import Citas

def get_default_user():
    default_user = User.objects.filter(is_superuser=True).first() or User.objects.first()
    return default_user.id if default_user else None

class Factura(models.Model):
    cita = models.OneToOneField(Citas, on_delete=models.CASCADE, related_name="factura")
    numero_factura = models.IntegerField()
    total = models.DecimalField(max_digits=10, decimal_places=2, default=25)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    pdf = models.FileField(upload_to='facturas/', blank=True, null=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, default=get_default_user)

    def __str__(self):
        return f"Factura {self.numero_factura} - {self.cita.patient.nombre}"

class ConfiguracionFactura(models.Model):
    numero_inicial = models.IntegerField()

    def __str__(self):
        return f"Configuración de Facturas - Número Inicial Facturación: {self.numero_inicial}"

