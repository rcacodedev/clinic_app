from django.contrib import admin
from .models import Worker
from django.contrib.auth.models import User

class WorkerAdmin(admin.ModelAdmin):
    list_display = ['user', 'branch', 'created_by', 'is_active']
    list_filter = ['branch', 'is_active']
    search_fields = ['user__username', 'user__email', 'created_by__username']

    # Para poder seleccionar el "trabajador" al crear o editar un usuario
    raw_id_fields = ('created_by',)

    # Agregar el perfil de trabajador a la vista de detalle
    fieldsets = (
        (None, {
            'fields': ('user', 'branch', 'created_by', 'is_active')
        }),
    )

    # Si deseas que el usuario se seleccione como "Trabajador" desde el admin de Usuario, se podría agregar un inline
    # Si quieres que el Worker se vea como inline dentro de User
    class WorkerInline(admin.TabularInline):
        model = Worker
        fields = ['branch', 'created_by', 'is_active']
        extra = 1

# Registrar el modelo Worker
admin.site.register(Worker, WorkerAdmin)
