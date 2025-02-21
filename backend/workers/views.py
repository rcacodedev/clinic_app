from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView, CreateAPIView
from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import IntegrityError
from .models import Worker, PDFRegistro
from .serializers import WorkerSerializer
from citas.models import Citas  # Importar modelo de citas
from citas.serializers import CitasSerializer # Importar serializer de citas
from backend.permissions import IsAdmin  # Tu permiso personalizado para administradores
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
import logging

logger = logging.getLogger(__name__)

class CustomPagination(PageNumberPagination):
    page_size = 5  # Número de PDFs por página
    page_size_query_param = 'page_size'
    max_page_size = 10

# Vista para listar y crear trabajadores
class WorkerListCreateView(ListCreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return Worker.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user

        # Guardar el trabajador con el usuario que lo creó
        worker = serializer.save(created_by=user)

        # Obtener los grupos de la solicitud
        groups = self.request.data.get('groups', [])

        # Asignar otros grupos si se proporcionaron
        if groups:
            worker.groups.set(groups)
            worker.save()

# Vista para obtener, actualizar y eliminar un trabajador
class WorkerDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Worker.objects.filter(created_by=self.request.user)

    def perform_update(self, serializer):
        worker = self.get_object()

        if worker.created_by != self.request.user:
            raise PermissionDenied("No tienes permiso para editar este trabajador.")

        serializer.save()

    def perform_destroy(self, instance):
        # Verificar permisos antes de eliminar
        if instance.created_by != self.request.user:
            raise PermissionDenied("No tienes permiso para eliminar este trabajador.")

        # Eliminar el usuario relacionado con el trabajador
        try:
            user = instance.user
            user.delete()  # Esto eliminará el usuario asociado
        except IntegrityError as e:
            logger.error(f"Error al eliminar el usuario: {e}")

        instance.delete()


# Vista para listar citas de un trabajador
class WorkerAppointmentsView(ListAPIView):
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        worker_id = self.kwargs.get('pk')
        worker = Worker.objects.filter(id=worker_id, created_by=self.request.user).first()
        if not worker:
            raise PermissionDenied("No tienes permiso para ver las citas de este trabajador.")
        return Citas.objects.filter(worker=worker)


# Vista para crear una cita para un trabajador
class CreateWorkerAppointmentView(CreateAPIView):
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        worker_id = self.kwargs.get('pk')
        worker = Worker.objects.get(id=worker_id)

        if worker.created_by != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("No tienes permiso para agregar citas a este trabajador.")

        serializer.save(worker=worker)

# Vista para editar una cita (permitir a admin editar cualquier cita)
class AppointmentDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Citas.objects.all()
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        worker_pk = self.kwargs.get('worker_pk')

        if self.request.user.is_staff:
            # Admin puede acceder a todas las citas del trabajador
            return Citas.objects.filter(worker__id=worker_pk)
        else:
            # Solo los creadores del trabajador pueden acceder a sus citas
            return Citas.objects.filter(worker__id=worker_pk, worker__created_by=self.request.user)

    def perform_update(self, serializer):
        cita = self.get_object()

        # Si el usuario es admin, puede actualizar cualquier cita
        if self.request.user.is_staff:
            serializer.save()
        # Si no es admin, solo puede editar las citas de los trabajadores que creó
        elif cita.worker.created_by != self.request.user:
            raise PermissionDenied("No tienes permiso para editar esta cita.")
        else:
            serializer.save()

    def perform_destroy(self, instance):
        # Los administradores pueden eliminar cualquier cita
        if self.request.user.is_staff:
            instance.delete()
        # Los creadores de los trabajadores solo pueden eliminar las citas de los trabajadores que crearon
        elif instance.worker.created_by != self.request.user:
            raise PermissionDenied("No tienes permiso para eliminar esta cita.")
        else:
            instance.delete()

# Vista para subir el archivo registro de jornada (para admin y trabajador)
class UploadPDF(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        worker = get_object_or_404(Worker, pk=pk)

        # Verificamos si es admin o worker para saber cómo asignar el PDF
        is_admin = request.user.groups.filter(name='Admin').exists()

        file = request.FILES.get('file')

        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Guardamos el archivo con FileSystemStorage
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_url = fs.url(filename)  # Esto te da la URL del archivo subido

        # Crear un nuevo registro de PDF
        pdf_registro = PDFRegistro.objects.create(
            worker=worker,
            file=file,
            created_by=request.user,
            is_admin_upload=is_admin
        )

        return Response({'message': 'PDF subido correctamente', 'file_url': file_url}, status=status.HTTP_200_OK)

# Vista para obtener los PDFs de un trabajador
class GetPDFs(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get(self, request, pk, *args, **kwargs):
        worker = get_object_or_404(Worker, pk=pk)

        # Obtener todos los PDFs del trabajador
        pdf_registros = PDFRegistro.objects.filter(worker=worker)

                # Si no hay PDFs, devolver una respuesta vacía en lugar de un error
        if not pdf_registros.exists():
            return Response({
                "admin_pdfs": [],
                "worker_pdfs": [],
                "total_pages_admin": 1,
                "total_pages_worker": 1,
                "current_page": 1
            }, status=status.HTTP_200_OK)  # 200 OK en vez de 404

        if pdf_registros.exists():
            # Filtrar PDFs por quién los subió
            admin_pdfs = pdf_registros.filter(is_admin_upload=True)
            worker_pdfs = pdf_registros.filter(is_admin_upload=False)

            # Aplicar paginación a cada grupo
            paginator = self.pagination_class()

            # Crear listas de URLs de los PDFs
            admin_pdfs_paginated = paginator.paginate_queryset(admin_pdfs, request)
            admin_pdf_urls = [request.build_absolute_uri(pdf.file.url) for pdf in admin_pdfs_paginated]
            worker_pdfs_paginated = paginator.paginate_queryset(worker_pdfs, request)
            worker_pdf_urls = [request.build_absolute_uri(pdf.file.url) for pdf in worker_pdfs_paginated]

            return Response({
                "admin_pdfs": admin_pdf_urls,
                "worker_pdfs": worker_pdf_urls,
                "total_pages_admin": paginator.page.paginator.num_pages if admin_pdfs_paginated else 0,
                "total_pages_worker": paginator.page.paginator.num_pages if worker_pdfs_paginated else 0,
                "current_page": paginator.page.number if admin_pdfs_paginated or worker_pdfs_paginated else 1
            }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_worker_by_user(request, user_id):
    try:
        # Obtener el Worker relacionado con el user_id
        worker = Worker.objects.get(user__id=user_id)
        return Response({"worker_id": worker.id}, status=status.HTTP_200_OK)
    except Worker.DoesNotExist:
        return Response({"detail": "Worker not found."}, status=status.HTTP_404_NOT_FOUND)