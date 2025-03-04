from django.db import models
from django.contrib.auth.models import User

class Formacion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='formaciones')
    titulo = models.CharField(max_length=255)
    profesional = models.CharField(max_length=255)
    lugar = models.TextField(blank=True, null=True)
    tematica = models.TextField(blank=True, null=True)
    fecha = models.DateField()
    hora = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titulo} - {self.user.username} ({self.fecha})"