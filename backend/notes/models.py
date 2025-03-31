from django.db import models

class Note(models.Model):
    titulo = models.CharField(max_length=255)
    contenido = models.TextField()
    created_at = models.DateField(auto_now_add=True)
    reminder_date = models.DateField(null=True, blank=True)
    color = models.CharField(max_length=20, default='#FFEE8C')
    is_important = models.BooleanField(default=False)

    def __str__(self):
        return self.titulo
