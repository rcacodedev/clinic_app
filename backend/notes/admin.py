from django.contrib import admin
from .models import Note

@admin.register(Note)
class NotaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "reminder_date", "is_important", "color")
    list_filter = ("is_important", "reminder_date")
    search_fields = ("titulo", "contenido")