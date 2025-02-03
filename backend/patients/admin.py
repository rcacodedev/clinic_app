from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'primer_apellido', 'segundo_apellido', 'email', 'phone', 'fecha_nacimiento')
    search_fields = ('nombre', 'primer_apellido', 'segundo_apellido', 'email')
