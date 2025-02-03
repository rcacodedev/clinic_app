from django.contrib import admin
from .models import Activity

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'monitor')  # Campos visibles en la lista
    list_filter = ('start_date', 'recurrence_days', 'monitor')  # Filtros en el panel lateral
    search_fields = ('name', 'description', 'monitor__name')  # Campos para buscar
    filter_horizontal = ('patients',)  # Para mejorar la selección de pacientes en el admin
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'start_date', 'start_time', 'recurrence_days')
        }),
        ('Asignaciones', {
            'fields': ('monitor', 'patients', 'user')
        }),
    )
