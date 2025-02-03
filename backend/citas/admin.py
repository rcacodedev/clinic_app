from django.contrib import admin
from .models import Citas

class CitasAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'fecha', 'comenzar', 'finalizar', 'descripcion')
    list_filter = ('fecha', 'patient')
    search_fields = ('patient__nombre', 'patient__primer_apellido', 'fecha')

admin.site.register(Citas, CitasAdmin)
