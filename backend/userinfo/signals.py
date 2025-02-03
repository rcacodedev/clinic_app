from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserInfo

@receiver(post_save, sender=User)
def create_user_info(sender, instance, created, **kwargs):
    if created:  # Solo se ejecuta cuando se crea un nuevo usuario
        UserInfo.objects.create(user=instance)