from django.db import models
from django.contrib.auth.models import User, Group


class Worker(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_workers')
    first_name = models.CharField(max_length=50, default='Desconocido')  # Valor por defecto adecuado
    last_name = models.CharField(max_length=50, default='Desconocido')  # Valor por defecto adecuado
    groups = models.ManyToManyField(Group, related_name='workers', blank=True)
    color = models.CharField(max_length=7, default="#ffffff")

    def __str__(self):
        return f"{self.user.username} - {self.groups}"

    @staticmethod
    def for_user(user):
        """
        Filtra trabajadores basados en el grupo y la rama del usuario.
        """
        if user.groups.filter(name='Admin').exists():
            return Worker.objects.filter(created_by=user)
        return Worker.objects.none()

class PDFRegistro(models.Model):
    worker = models.ForeignKey(Worker, related_name='pdf_registros', on_delete=models.CASCADE)
    file = models.FileField(upload_to='media/registro_jornada/', blank=True, null=True)
    created_by = models.ForeignKey(User, related_name='pdf_registros', on_delete=models.CASCADE)
    is_admin_upload = models.BooleanField(default=False)

    def __str__(self):
        return f"PDF subido por {'Admin' if self.is_admin_upload else 'Empleado'} - {self.worker.user.username}"