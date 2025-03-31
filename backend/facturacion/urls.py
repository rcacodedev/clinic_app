from django.urls import path
from .views import FacturaViewSet, FacturaPDFView, FacturasPorPacienteView, ConfiguracionFacturaView

urlpatterns = [
    # Endpoint para listar y crear facturas con paginación y filtros
    path("", FacturaViewSet.as_view(), name="factura-list-create"),

    # Endpoint para obtener/eliminar una factura en PDF por su ID
    path("<int:pk>/pdf/", FacturaPDFView.as_view(), name="factura-pdf"),

    # Endpoint para ver las facturas de los pacientes por su ID
    path("paciente/<int:paciente_id>/", FacturasPorPacienteView.as_view(), name='facturas-por-paciente'),

    #Endpoint para cambiar el numero de facturacion inicial
    path("configuracion-factura/", ConfiguracionFacturaView.as_view(), name='configuracion-factura'),
]
