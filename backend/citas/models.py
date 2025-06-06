from django.db import models
from patients.models import Paciente
from workers.models import Worker
from django.contrib.auth.models import User

METODOS_PAGO = [
    ('efectivo', 'Efectivo'),
    ('bizum', 'Bizum'),
    ('tarjeta', 'Tarjeta'),
    ('transferencia', 'Transferencia'),
]

class Cita(models.Model):
    paciente = models.ForeignKey(Paciente, related_name='citas_pacientes', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    fecha = models.DateField()
    comenzar = models.TimeField()
    finalizar = models.TimeField()
    descripcion = models.TextField(blank=True, null=True)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='citas_worker', null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=25)
    cotizada = models.BooleanField(default=False)
    irpf = models.BooleanField(default=False)
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO, default='efectivo')
    pagado = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        if self.paciente:
            return f"Cita de {self.paciente.nombre} {self.paciente.primer_apellido} el {self.fecha} a las {self.comenzar}"
        return f"Cita sin paciente el {self.fecha} a las {self.comenzar}"


class ConfiguracionPrecioCita(models.Model):
    precio_global = models.DecimalField(max_digits=10, decimal_places=2, default=25)

    def __str__(self):
        return f"Precio Global de las citas: {self.precio_global}"