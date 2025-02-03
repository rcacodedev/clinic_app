from django.db import models
from patients.models import Patient
from workers.models import Worker
from django.contrib.auth.models import User

class Citas(models.Model):
    patient = models.ForeignKey(Patient, related_name='citas', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    fecha = models.DateField()
    comenzar = models.TimeField()
    finalizar = models.TimeField()
    descripcion = models.TextField(blank=True, null=True)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='appointments', null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cotizada = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Si el precio no se especifica, usa el precio base de ConfiguracionFinanzas
        from finanzas.models import ConfiguracionFinanzas
        if self.precio is None or self.precio == 0:
            configuracion = ConfiguracionFinanzas.objects.first()
            if configuracion:
                self.precio = configuracion.precio_cita_base
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Cita de {self.patient.nombre} {self.patient.primer_apellido} el {self.fecha} a las {self.comenzar}"