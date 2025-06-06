from django.urls import path
from .views import CitasDetailAPIView, CitasListCreateAPIView, EnviarRecordatorioWhatsAppAPIView, ConfiguracionPrecioGlobal

app_name = "citas"

urlpatterns = [
    path("", CitasListCreateAPIView.as_view(), name='lista-crear-citas'),
    path("<int:pk>/", CitasDetailAPIView.as_view(), name='citas-detalle'),
    path("enviar-whatsapp/", EnviarRecordatorioWhatsAppAPIView.as_view(), name='enviar-whatsapp'),
    path("configurar-precio/", ConfiguracionPrecioGlobal.as_view(), name='configuracion-precio'),
]
