# urls.py
from django.urls import path
from .views import CrearGananciasCitasView, ListarGananciasCitasView, ConfiguracionFinanzasView, CrearGastoView, ListarGastosView, MarcarCitaCotizadaView, FinanzasBalanceView, ObtenerEstadoIngresosView

urlpatterns = [
    path('ganancias-citas/', ListarGananciasCitasView.as_view(), name='listar-ganancias-citas'),
    path('estado-ingresos/', ObtenerEstadoIngresosView.as_view(), name='estado-ingresos'),
    path('ganancias-citas/<int:cita_id>/', CrearGananciasCitasView.as_view(), name='crear-ganancia-cita'),
    path('mark-cotizada/<int:cita_id>/', MarcarCitaCotizadaView.as_view(), name='marcar-cita-cotizada'),
    path('gasto/', CrearGastoView.as_view(), name='crear-gasto'),
    path('gastos/', ListarGastosView.as_view(), name='listar-gastos'),
    path('configuracion/', ConfiguracionFinanzasView.as_view(), name='configuracion-finanzas'),
    path('balance/', FinanzasBalanceView.as_view(), name='finanzas-balance'),
]
