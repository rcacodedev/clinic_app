from django.db import models
from citas.models import Citas
from userinfo.models import UserInfo
from actividades.models import Activity

class Transaccion(models.Model):
    INGRESO = 'INGRESO'
    GASTO = 'GASTO'
    INGRESO_COTIZADO = 'INGRESO_COTIZADO'

    TIPO_CHOICES = [
        (INGRESO, 'Ingreso'),
        (GASTO, 'Gasto'),
        (INGRESO_COTIZADO, 'Ingreso_Cotizado')
    ]

    tipo = models.CharField(
        max_length=100,
        choices=TIPO_CHOICES,
        default=INGRESO,
    )
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    cita = models.ForeignKey(Citas, on_delete=models.CASCADE, null=True, blank=True)  # Relacionado con la cita
    actividad = models.ForeignKey(Activity, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(UserInfo, on_delete=models.CASCADE)  # Relacionado con el usuario que cotiza
    url = models.URLField(null=True, blank=True)
    cita_registrada = models.BooleanField(default=False)

    def __str__(self):
        return f"Transacción de {self.tipo} por {self.monto} para la cita {self.cita}"

class ConfiguracionFinanzas(models.Model):
    precio_cita_base = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Precio base de la cita")
    precio_actividad_base = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Precio base de la actividad")
    ultima_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Configuración de Finanzas (Precio Cita: {self.precio_cita_base})"