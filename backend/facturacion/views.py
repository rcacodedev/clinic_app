from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.http import FileResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now
from datetime import timedelta
import os

from .models import Factura, ConfiguracionFactura
from citas.models import Cita
from .serializers import FacturaSerializer, ConfiguracionFacturaSerializer
from .utils import generar_pdf_factura, generar_pdf_factura_irpf

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
        if not cita_id:
            raise ValidationError({"error": "Se debe proporcionar el ID de la cita."})

        cita = get_object_or_404(Cita, id=cita_id)

        # Intentamos obtener la cita (no filtramos por cotizada porque ahora puede ser irpf también)
        try:
            cita = Cita.objects.get(id=cita_id)
        except Cita.DoesNotExist:
            return Response({"error": "La cita no existe"}, status=status.HTTP_400_BAD_REQUEST)

        # Validar que al menos cotizada o irpf esté marcado, si no, no tiene sentido crear factura
        if not (cita.cotizada or cita.irpf):
            return Response({"error": "La cita no está marcada como cotizada ni con IRPF"}, status=status.HTTP_400_BAD_REQUEST)

        usuario_actual = request.user

        if usuario_actual.groups.filter(name="Fisioterapia").exists():
            usuario_admin_fisio = User.objects.filter(groups__name="Admin").filter(groups__name="Fisioterapia").first()
            if not usuario_admin_fisio:
                return Response({"error": "No se encontró ningún usuario Admin en Fisioterapia"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                datos_facturacion = usuario_admin_fisio.userInfo
            except User.DoesNotExist:
                return Response({"error": "El usuario administrador de fisioterapia no tiene información registrada"},
                                status=status.HTTP_400_BAD_REQUEST)
            usuario_facturacion = usuario_admin_fisio
        else:
            try:
                datos_facturacion = usuario_actual.userInfo
            except User.DoesNotExist:
                return Response({"error": "No tienes información de facturación registrada"},
                                status=status.HTTP_400_BAD_REQUEST)
            usuario_facturacion = usuario_actual

        config = ConfiguracionFactura.objects.first()
        numero_inicial = config.numero_inicial if config else "1"

        ultima_factura = Factura.objects.order_by("-numero_factura").first()
        if ultima_factura:
            try:
                nuevo_numero_factura = str(int(ultima_factura.numero_factura) + 1)
            except ValueError:
                return Response({"error": "El último número de factura no es numérico."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            nuevo_numero_factura = numero_inicial

        facturas_creadas = []

        # Factura para cotizada
        if cita.cotizada:
            factura = Factura.objects.create(
                cita=cita,
                numero_factura=nuevo_numero_factura,
                total=cita.precio,
                usuario=usuario_facturacion
            )
            factura.pdf = generar_pdf_factura(factura, datos_facturacion)
            factura.save()
            facturas_creadas.append(factura)

        # Factura para irpf
        if cita.irpf:
            try:
                nuevo_numero_factura_irpf = str(int(nuevo_numero_factura) + 1)
            except ValueError:
                nuevo_numero_factura_irpf = str(int(numero_inicial) + 1)

            # Aquí puedes modificar el total si quieres aplicar retención o algo
            total_irpf = cita.precio  # O ajusta el total según reglas de IRPF

            factura_irpf = Factura.objects.create(
                cita=cita,
                numero_factura=nuevo_numero_factura_irpf,
                total=total_irpf,
                usuario=usuario_facturacion
            )
            factura_irpf.pdf = generar_pdf_factura_irpf(factura_irpf, datos_facturacion)
            factura_irpf.save()
            facturas_creadas.append(factura_irpf)

        serializer = FacturaSerializer(facturas_creadas, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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

        queryset = Factura.objects.filter(cita__paciente_id=paciente_id).order_by("-fecha_creacion")

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

