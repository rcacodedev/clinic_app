from django.db import models
from django.contrib.auth.models import User
from patients.models import Paciente  # Asegúrate de importar el modelo de pacientes
from django.core.exceptions import ValidationError

def clean(self):
    if self.start_time >= self.end_time:
        raise ValidationError("La hora de inicio debe ser anterior a la hora de finalización.")

class Activity(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField(null=True, blank=True)
    recurrence_days = models.JSONField(default=list)  # Día(s) de la semana en que la actividad se repite
    start_time = models.TimeField(default="00:00")
    end_time = models.TimeField(default="00:00")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pacientes = models.ManyToManyField(Paciente)
    monitor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='monitored_activities')
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0)


    def __str__(self):
        return self.name
