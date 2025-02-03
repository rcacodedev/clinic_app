from django.db import models
from django.contrib.auth.models import User

class Worker(models.Model):
    BRANCH_CHOICES = [
        ('fisioterapia', 'Fisioterapia'),
        ('psicologia', 'Psicología'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile')
    branch = models.CharField(max_length=50, choices=BRANCH_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_workers')
    is_active = models.BooleanField(default=True)
    first_name = models.CharField(max_length=50, default='Desconocido')  # Valor por defecto adecuado
    last_name = models.CharField(max_length=50, default='Desconocido')  # Valor por defecto adecuado
    dni = models.CharField(max_length=20, default='12345678A')
    address = models.CharField(max_length=255, default='Sin dirección')  # Valor por defecto
    postal_code = models.CharField(max_length=10, default='00000')  # Valor por defecto adecuado
    country = models.CharField(max_length=50, default="España")  # Valor por defecto adecuado
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.branch}"

    @staticmethod
    def for_user(user):
        """
        Filtra trabajadores basados en el grupo y la rama del usuario.
        """
        if user.groups.filter(name='Admin').exists():
            return Worker.objects.filter(created_by=user)
        return Worker.objects.none()
