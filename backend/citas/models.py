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
    efectivo = models.BooleanField(default=True)
    bizum = models.BooleanField(default=False)
    pagado = models.BooleanField(default=False)

    def __str__(self):
        return f"Cita de {self.patient.nombre} {self.patient.primer_apellido} el {self.fecha} a las {self.comenzar}"