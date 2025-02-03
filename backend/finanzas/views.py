# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from finanzas.models import Transaccion, ConfiguracionFinanzas
from citas.models import Citas
from django.db.models import Sum
from .serializers import TransaccionSerializer, ConfiguracionFinanzasSerializer
from django.db.models import Q
from rest_framework.exceptions import NotFound
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination

def obtener_transacciones_por_periodo(filtro, usuario_info):
    hoy = timezone.now()
    transacciones = Transaccion.objects.filter(user=usuario_info)

    if filtro == 'mensual':
        inicio_mes = hoy.replace(day=1)
        transacciones = transacciones.filter(fecha__gte=inicio_mes)
    elif filtro == 'trimestral':
        inicio_trimestre = hoy - timedelta(days=90)
        transacciones = transacciones.filter(fecha__gte=inicio_trimestre)
    elif filtro == 'anual':
        inicio_anio = hoy.replace(month=1, day=1)
        transacciones = transacciones.filter(fecha__gte=inicio_anio)

    return transacciones

def obtener_balance_por_periodo(tipo, filtro, usuario_info):
    hoy = timezone.now()
    transacciones = Transaccion.objects.filter(tipo=tipo, user=usuario_info)

    if filtro == 'mensual':
        inicio_mes = hoy.replace(day=1)
        transacciones = transacciones.filter(fecha__gte=inicio_mes)
    elif filtro == 'trimestral':
        inicio_trimestre = hoy - timedelta(days=90)
        transacciones = transacciones.filter(fecha__gte=inicio_trimestre)
    elif filtro == 'anual':
        inicio_anio = hoy.replace(month=1, day=1)
        transacciones = transacciones.filter(fecha__gte=inicio_anio)

    return transacciones.aggregate(Sum('monto'))['monto__sum'] or 0

class TransaccionPagination(PageNumberPagination):
    page_size = 10

class ListarGananciasCitasView(APIView):
    """
    Listar las transacciones de ganancias por citas.
    """
    def get(self, request):
        filtro = request.query_params.get('filtro', 'total')
        usuario_info = request.user.userInfo
        transacciones = obtener_transacciones_por_periodo(filtro, usuario_info).filter(Q(tipo='INGRESO') | Q(tipo='INGRESO_COTIZADO'))

        paginator = TransaccionPagination()
        result_page = paginator.paginate_queryset(transacciones, request)
        serializer = TransaccionSerializer(result_page, many=True)
        return Response(serializer.data)

class CrearGananciasCitasView(APIView):
    """
    Vista para crear una transacción de tipo 'Ingreso' o 'Gasto'.
    Asocia la transacción a una cita y al usuario que la cotiza.
    """
    def post(self, request, cita_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Usuario no autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            cita = Citas.objects.get(id=cita_id)
        except Citas.DoesNotExist:
            raise NotFound("Cita no encontrada.")

        if cita.user != request.user:
            return Response({"detail": "No puedes modificar una cita de otro usuario."}, status=status.HTTP_403_FORBIDDEN)

        # Verificar si ya hay una transacción registrada para esta cita
        if Transaccion.objects.filter(cita=cita, cita_registrada=True).exists():
            return Response({"detail": "La cita ya tiene una transacción registrada."}, status=status.HTTP_400_BAD_REQUEST)

        monto = request.data.get('monto')
        descripcion = request.data.get('descripcion')
        if monto is None or descripcion is None:
            return Response({"detail": "Se requieren los campos 'monto' y 'descripcion'."}, status=status.HTTP_400_BAD_REQUEST)

        tipo = 'INGRESO' if not cita.cotizada else 'INGRESO_COTIZADO'

        usuario_info = getattr(request.user, 'userInfo', None)
        if usuario_info is None:
            return Response({"detail": "Información del usuario no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        # Crear la transacción solo si no existe una registrada
        transaccion = Transaccion.objects.create(
            tipo=tipo,
            monto=monto,
            descripcion=descripcion,
            cita=cita,
            user=usuario_info,
            cita_registrada=True,
        )

        serializer = TransaccionSerializer(transaccion)
        return Response(serializer.data)

class ObtenerEstadoIngresosView(APIView):
    """
    Vista para obtener si estamos almacenando el ingreso
    """
    def get(self, request, *args, **kwargs):
        user_id = request.user.id
        transacciones = Transaccion.objects.filter(user_id=user_id, cita_registrada=True)
        citas_ingresadas = [transaccion.cita.id for transaccion in transacciones]
        return Response({"citas_ingresadas": citas_ingresadas})

class MarcarCitaCotizadaView(APIView):
    """
    Vista para marcar una cita como cotizada
    """
    def post(self, request, cita_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Usuario no autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            cita = Citas.objects.get(id=cita_id)
        except Citas.DoesNotExist:
            raise NotFound("Cita no encontrada.")
        print('Cita user:', cita.user)
        print('Cita userinfo', request.user.userInfo)
        if cita.user.pk != request.user.userInfo.pk:
            return Response({"detail": "No puedes modificar una cita de otro usuario."}, status=status.HTTP_403_FORBIDDEN)

        cita.cotizada = True
        cita.save()

        return Response({"message": "Cita marcada como cotizada"}, status=status.HTTP_200_OK)

class CrearGastoView(APIView):
    """
    Vista para crear un gasto independiente de las citas.
    """
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Usuario no autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        monto = request.data.get('monto')
        descripcion = request.data.get('descripcion')
        if monto is None or descripcion is None:
            return Response({"detail": "Se requieren los campos 'monto' y 'descripcion'."}, status=status.HTTP_400_BAD_REQUEST)

        tipo = "GASTO"
        url = request.data.get('url', None)

        usuario_info = request.user.userInfo
        gasto = Transaccion.objects.create(
            tipo=tipo,
            monto=monto,
            descripcion=descripcion,
            user=usuario_info,
            url=url
        )

        serializer = TransaccionSerializer(gasto)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ListarGastosView(APIView):
    """
    Listar los gastos del usuario autenticado
    """
    def get(self, request):
        filtro = request.query_params.get('filtro', 'total')
        usuario_info = request.user.userInfo
        gastos = obtener_transacciones_por_periodo(filtro, usuario_info).filter(tipo='GASTO')

        paginator = TransaccionPagination()
        result_page = paginator.paginate_queryset(gastos, request)
        serializer = TransaccionSerializer(result_page, many=True)
        return Response(serializer.data)

class ConfiguracionFinanzasView(APIView):
    """
    Obtener y actualizar la configuración de finanzas.
    """
    def get(self, request):
        configuracion = ConfiguracionFinanzas.objects.first()
        if not configuracion:
            configuracion = ConfiguracionFinanzas.objects.create(precio_cita_base=0)
        serializer = ConfiguracionFinanzasSerializer(configuracion)
        return Response(serializer.data)

    def put(self, request):
        configuracion = ConfiguracionFinanzas.objects.first()
        if not configuracion:
            configuracion = ConfiguracionFinanzas.objects.create(precio_cita_base=0)

        if 'precio_cita' in request.data:
            request.data['precio_cita'] = float(request.data['precio_cita'])

        serializer = ConfiguracionFinanzasSerializer(configuracion, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FinanzasBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario_info = request.user.userInfo

        # Obtención de los balances por periodo
        ingresos_totales = obtener_balance_por_periodo('INGRESO', 'total', usuario_info)
        ingresos_cotizados_totales = obtener_balance_por_periodo('INGRESO_COTIZADO', 'total', usuario_info)
        gastos_totales = obtener_balance_por_periodo('GASTO', 'total', usuario_info)

        ingresos_mes = obtener_balance_por_periodo('INGRESO', 'mensual', usuario_info)
        ingresos_cotizados_mes = obtener_balance_por_periodo('INGRESO_COTIZADO', 'mensual', usuario_info)
        gastos_mes = obtener_balance_por_periodo('GASTO', 'mensual', usuario_info)

        ingresos_trimestre = obtener_balance_por_periodo('INGRESO', 'trimestral', usuario_info)
        ingresos_cotizados_trimestre = obtener_balance_por_periodo('INGRESO_COTIZADO', 'trimestral', usuario_info)
        gastos_trimestre = obtener_balance_por_periodo('GASTO', 'trimestral', usuario_info)

        ingresos_anio = obtener_balance_por_periodo('INGRESO', 'anual', usuario_info)
        ingresos_cotizados_anio = obtener_balance_por_periodo('INGRESO_COTIZADO', 'anual', usuario_info)
        gastos_anio = obtener_balance_por_periodo('GASTO', 'anual', usuario_info)

        return Response({
            'ingresos_totales': ingresos_totales,
            'ingresos_cotizados_totales': ingresos_cotizados_totales,
            'gastos_totales': gastos_totales,
            'ingresos_mes': ingresos_mes,
            'ingresos_cotizados_mes': ingresos_cotizados_mes,
            'gastos_mes': gastos_mes,
            'ingresos_trimestre': ingresos_trimestre,
            'ingresos_cotizados_trimestre': ingresos_cotizados_trimestre,
            'gastos_trimestre': gastos_trimestre,
            'ingresos_anio': ingresos_anio,
            'ingresos_cotizados_anio': ingresos_cotizados_anio,
            'gastos_anio': gastos_anio,
        })
