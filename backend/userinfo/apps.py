from django.apps import AppConfig


class UserinfoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'userinfo'

    def ready(self):
        import userinfo.signals