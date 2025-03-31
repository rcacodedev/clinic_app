from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.http import FileResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils.timezone import now, timedelta
import os

from .models import Factura, ConfiguracionFactura
from citas.models import Citas
from .serializers import FacturaSerializer, ConfiguracionFacturaSerializer
from .utils import generar_pdf_factura

class FacturaPagination(PageNumberPagination):
    page_size = 10  # Cantidad de facturas por página
    page_size_query_param = "page_size"  # Permitir que el usuario cambie el tamaño de página
    max_page_size = 50  # Máximo de facturas por página

# Listar y crear Factura
class FacturaViewSet(generics.ListCreateAPIView):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FacturaPagination

    def get_queryset(self):
        queryset = Factura.objects.all().order_by("-numero_factura")
        filtro = self.request.query_params.get("filtro", None)
        fecha = self.request.query_params.get("fecha", None)  # Recibe una fecha en formato 'YYYY-MM-DD'

        if filtro == "hoy":
            queryset = queryset.filter(fecha_creacion__date=now().date())

        elif filtro == "semana":
            semana_inicio = now() - timedelta(days=now().weekday())  # Inicio de la semana
            queryset = queryset.filter(fecha_creacion__date__gte=semana_inicio)

        elif filtro == "mes":
            queryset = queryset.filter(fecha_creacion__year=now().year, fecha_creacion__month=now().month)

        elif filtro == "año":
            queryset = queryset.filter(fecha_creacion__year=now().year)

        elif fecha:
            try:
                from datetime import datetime
                fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
                queryset = queryset.filter(fecha_creacion__date=fecha_obj)
            except ValueError:
                pass  # Si el formato es incorrecto, no aplica el filtro

        return queryset

    def post(self, request, *args, **kwargs):
        cita_id = request.data.get("cita")

        # Validar que la cita existe y está cotizada
        try:
            cita = Citas.objects.get(id=cita_id, cotizada=True)
        except Citas.DoesNotExist:
            return Response({"error": "La cita no existe o no está cotizada"}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener el usuario autenticado
        usuario_actual = request.user

        # Verificar si el usuario actual pertenece al grupo "fisioterapia"
        if usuario_actual.groups.filter(name="Fisioterapia").exists():
            # Buscar el usuario que está en ambos grupos: "admin" y "fisioterapia"
            usuario_admin_fisio = User.objects.filter(groups__name="Admin").filter(groups__name="Fisioterapia").first()
            if not usuario_admin_fisio:
                return Response({"error": "No se encontró ningún usuario Admin en Fisioterapia"}, status=status.HTTP_400_BAD_REQUEST)

            # Obtener los datos de facturación del usuario administrador de fisioterapia
            try:
                datos_facturacion = usuario_admin_fisio.userInfo
            except User.DoesNotExist:
                return Response({"error": "El usuario administrador de fisioterapia no tiene información registrada"},
                                status=status.HTTP_400_BAD_REQUEST)

            usuario_facturacion = usuario_admin_fisio  # Facturar con el admin de fisioterapia
        else:
            # Para los demás usuarios, usar sus propios datos
            try:
                datos_facturacion = usuario_actual.userInfo
            except User.DoesNotExist:
                return Response({"error": "No tienes información de facturación registrada"},
                                status=status.HTTP_400_BAD_REQUEST)

            usuario_facturacion = usuario_actual  # Facturar con el usuario actual

        # Obtener el número inicial desde ConfiguracionFactura
        config = ConfiguracionFactura.objects.first()
        numero_inicial = config.numero_inicial if config else "1"  # Como ahora es CharField, lo tratamos como string

        # Obtener el último número de factura registrado
        ultima_factura = Factura.objects.order_by("-numero_factura").first()

        if ultima_factura:
            try:
                nuevo_numero_factura = str(int(ultima_factura.numero_factura) + 1)  # Convertir a int y luego a str
            except ValueError:
                return Response({"error": "El último número de factura no es numérico."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            nuevo_numero_factura = numero_inicial  # Usar el número inicial como string

        # Crear la factura con los datos del usuario correcto
        factura = Factura.objects.create(
            cita=cita,
            numero_factura=nuevo_numero_factura,
            total=cita.precio,
            usuario=usuario_facturacion  # Guardar el usuario que corresponde
        )

        # Generar y asignar el PDF con los datos correctos
        factura.pdf = generar_pdf_factura(factura, datos_facturacion)
        factura.save()

        return Response(FacturaSerializer(factura).data, status=status.HTTP_201_CREATED)

# Obtener y eliminar Factura en PDF
class FacturaPDFView(generics.RetrieveDestroyAPIView):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        factura = self.get_object()
        if not factura.pdf or not os.path.exists(factura.pdf.path):
            return Response({"error": "Factura PDF no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(open(factura.pdf.path, 'rb'), content_type='application/pdf')

    def delete(self, request, *args, **kwargs):
        factura = self.get_object()
        if factura.pdf and os.path.exists(factura.pdf.path):
            os.remove(factura.pdf.path)
        factura.delete()
        return Response({"message": "Factura eliminada"}, status=status.HTTP_204_NO_CONTENT)

# Paginación para los pacientes
class FacturaPacientePagination(PageNumberPagination):
    page_size = 10  # Cantidad de facturas por página
    page_size_query_param = "page_size"
    max_page_size = 50  # Máximo de facturas por página

# Obtener facturas de un paciente desde su id
class FacturasPorPacienteView(generics.ListAPIView):
    serializer_class = FacturaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FacturaPacientePagination

    def get_queryset(self):
        paciente_id = self.kwargs.get("paciente_id")

        if not paciente_id:
            return Factura.objects.none()

        queryset = Factura.objects.filter(cita__patient_id=paciente_id).order_by("-fecha_creacion")

        # Filtros
        mes = self.request.query_params.get("mes", None)
        año = self.request.query_params.get("año", None)
        dia = self.request.query_params.get("dia", None)

        if mes:
            queryset = queryset.filter(fecha_creacion__month=int(mes))
        if año:
            queryset = queryset.filter(fecha_creacion__year=int(año))
        if dia:
            queryset = queryset.filter(fecha_creacion__day= int(dia))

        return queryset

    def list(self, request, *args, **kwargs):
        paciente_id = self.kwargs.get("paciente_id")
        if not paciente_id:
            return Response({"error": "Se requiere un ID de paciente"}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "No hay facturas para este paciente"}, status=status.HTTP_404_NOT_FOUND)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Configurar numero de Factura inicial
class ConfiguracionFacturaView(generics.RetrieveUpdateAPIView):
    queryset = ConfiguracionFactura.objects.all()
    serializer_class = ConfiguracionFacturaSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return ConfiguracionFactura.objects.first()