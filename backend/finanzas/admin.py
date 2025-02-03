from django.contrib import admin
from .models import Transaccion, ConfiguracionFinanzas


class TransaccionAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'monto', 'descripcion', 'fecha', 'cita', 'user', 'url')  # Campos para mostrar en la lista
    list_filter = ('tipo', 'fecha', 'user', 'cita')  # Filtros para el panel lateral
    search_fields = ('descripcion', 'user__username', 'cita__id')  # Búsqueda por descripción, usuario o cita
    ordering = ('-fecha',)  # Ordenar por fecha de manera descendente
    date_hierarchy = 'fecha'  # Permite filtrar por fecha jerárquica

    def save_model(self, request, obj, form, change):
        # Aquí puedes agregar lógica adicional antes de guardar
        obj.user = request.user  # Asignar el usuario que está haciendo la transacción
        super().save_model(request, obj, form, change)

class ConfiguracionFinanzasAdmin(admin.ModelAdmin):
    list_display = ('precio_cita_base', 'ultima_actualizacion')  # Mostrar el precio y la última actualización
    search_fields = ('precio_cita_base',)  # Búsqueda por el precio base de la cita
    ordering = ('-ultima_actualizacion',)  # Ordenar por la última actualización de manera descendente

# Registro de los modelos
admin.site.register(Transaccion, TransaccionAdmin)
admin.site.register(ConfiguracionFinanzas, ConfiguracionFinanzasAdmin)
