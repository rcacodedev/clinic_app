from django.db import models
from django.contrib.auth.models import User

class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="userInfo")
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    dni = models.CharField(max_length=10, blank=True, null=True)
    postal_code = models.CharField(max_length=6, blank=True, null=True)
    city = models.CharField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    segundo_apellido = models.CharField(max_length=200, blank=True)
    photo = models.ImageField(upload_to='foto_perfil/', blank=True, null=True, default='default_photo.jpg')
    whatsapp_business_number = models.CharField(max_length=15, blank=True, null=True)
    twilio_whatsapp_service_sid = models.CharField(max_length=255, blank=True, null=True)
    twilio_integration_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Información de {self.user.username}"