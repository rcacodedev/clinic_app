from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView, CreateAPIView
from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import IntegrityError
from .models import Worker, PDFRegistro
from .serializers import WorkerSerializer, PDFRegistroSerializer
from citas.models import Cita
from citas.serializers import CitaSerializer
from backend.permissions import IsAdminOrReadOnlyForWorkers
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
import logging
import os

logger = logging.getLogger(__name__)

class CustomPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 10

@api_view(['GET'])
def get_worker_by_user(request, user_id):
    try:
        worker = Worker.objects.get(user__id=user_id)
    except Worker.DoesNotExist:
        return Response({'detail': 'Worker not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = WorkerSerializer(worker)
    return Response(serializer.data)


class WorkerIdFromUserId(APIView):
    def get(self, request, user_id):
        try:
            worker = Worker.objects.get(user__id=user_id)
        except Worker.DoesNotExist:
            return Response({'detail': 'Worker not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'worker_id': worker.id})

class WorkerListCreateView(ListCreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnlyForWorkers]

    def get_queryset(self):
        user = self.request.user
        user_groups = set(user.groups.values_list("name", flat=True))

        is_admin = "Admin" in user_groups
        has_fisio = "Fisioterapia" in user_groups
        has_psico = "Psicología" in user_groups

        # Admin + Fisioterapia o Admin + Psicología ven todos los workers
        if is_admin and (has_fisio or has_psico):
            return Worker.objects.all().order_by('id')

        # Admin + otros grupos (que no sean Fisio ni Psico) ven solo sus workers
        if is_admin and not (has_fisio or has_psico):
            return Worker.objects.filter(created_by=user).order_by('id')

        # Trabajadores normales ven solo su propio worker
        return Worker.objects.filter(user=user).order_by('id')

    def perform_create(self, serializer):
        user = self.request.user
        worker = serializer.save(created_by=user)

        groups = self.request.data.get('groups', [])
        if groups:
            worker.groups.set(groups)
            worker.save()

class WorkerDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_groups = set(user.groups.values_list("name", flat=True))

        is_admin = "Admin" in user_groups
        has_fisio = "Fisioterapia" in user_groups
        has_psico = "Psicología" in user_groups

        if is_admin and (has_fisio or has_psico):
            # Admin + Fisio o Psico pueden acceder a todos
            return Worker.objects.all().order_by('id')

        if is_admin and not (has_fisio or has_psico):
            # Admin otros grupos solo sus workers
            return Worker.objects.filter(created_by=user).order_by('id')

        # Worker normal solo ve su worker
        return Worker.objects.filter(user=user).order_by('id')

    def perform_update(self, serializer):
        worker = self.get_object()
        user = self.request.user

        if worker.created_by != user and not (user.is_staff and ("Fisioterapia" in user.groups.values_list("name", flat=True) or "Psicología" in user.groups.values_list("name", flat=True))):
            raise PermissionDenied("No tienes permiso para editar este trabajador.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.created_by != user and not (user.is_staff and ("Fisioterapia" in user.groups.values_list("name", flat=True) or "Psicología" in user.groups.values_list("name", flat=True))):
            raise PermissionDenied("No tienes permiso para eliminar este trabajador.")

        try:
            user_rel = instance.user
            user_rel.delete()
        except IntegrityError as e:
            logger.error(f"Error al eliminar el usuario: {e}")

        instance.delete()

class WorkerAppointmentsView(ListAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        worker_id = self.kwargs.get('worker_pk')
        worker = get_object_or_404(Worker, id=worker_id)

        user_groups = set(user.groups.values_list("name", flat=True))
        is_admin = "Admin" in user_groups
        has_fisio = "Fisioterapia" in user_groups
        has_psico = "Psicología" in user_groups

        # Admin + Fisio o Psico ven todas las citas de cualquier worker
        if is_admin and (has_fisio or has_psico):
            return Cita.objects.filter(worker=worker)

        # Admin (otros grupos) que creó el worker ve todas sus citas
        if is_admin and not (has_fisio or has_psico) and worker.created_by == user:
            return Cita.objects.filter(worker=worker)

        # Worker normal solo ve sus citas y las creadas por el user que creó el worker
        if worker.user == user:
            # Solo las citas que creó el user que creó el worker
            return Cita.objects.filter(worker=worker, user=worker.created_by)

        # Otros casos no tienen permiso
        raise PermissionDenied("No tienes permiso para ver las citas de este trabajador.")

class CreateWorkerAppointmentView(CreateAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        worker_id = self.kwargs.get('worker_pk')
        worker = get_object_or_404(Worker, id=worker_id)

        user_groups = set(user.groups.values_list("name", flat=True))
        is_admin = "Admin" in user_groups

        if worker.created_by != user and not is_admin:
            raise PermissionDenied("No tienes permiso para agregar citas a este trabajador.")

        serializer.save(worker=worker, user=user)

class AppointmentDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        worker_pk = self.kwargs.get('worker_pk')
        worker = get_object_or_404(Worker, pk=worker_pk)

        user_groups = set(user.groups.values_list("name", flat=True))
        is_admin = "Admin" in user_groups
        has_fisio = "Fisioterapia" in user_groups
        has_psico = "Psicología" in user_groups

        if is_admin and (has_fisio or has_psico):
            return Cita.objects.filter(worker=worker).order_by('fecha')

        if is_admin and not (has_fisio or has_psico) and worker.created_by == user:
            return Cita.objects.filter(worker=worker).order_by('fecha')

        # Worker solo ve sus citas creadas por el creador del worker
        if worker.user == user:
            return Cita.objects.filter(worker=worker, user=worker.created_by).order_by('fecha')

        raise PermissionDenied("No tienes permiso para ver o editar esta cita.")

    def perform_update(self, serializer):
        user = self.request.user
        cita = self.get_object()
        worker = cita.worker

        user_groups = set(user.groups.values_list("name", flat=True))
        is_admin = "Admin" in user_groups
        has_fisio = "Fisioterapia" in user_groups
        has_psico = "Psicología" in user_groups

        if is_admin and (has_fisio or has_psico):
            serializer.save()
            return

        if is_admin and not (has_fisio or has_psico) and worker.created_by == user:
            serializer.save()
            return

        if worker.user == user and cita.user == worker.created_by:
            serializer.save()
            return

        raise PermissionDenied("No tienes permiso para editar esta cita.")

    def perform_destroy(self, instance):
        user = self.request.user
        worker = instance.worker

        user_groups = set(user.groups.values_list("name", flat=True))
        is_admin = "Admin" in user_groups
        has_fisio = "Fisioterapia" in user_groups
        has_psico = "Psicología" in user_groups

        if is_admin and (has_fisio or has_psico):
            instance.delete()
            return

        if is_admin and not (has_fisio or has_psico) and worker.created_by == user:
            instance.delete()
            return

        if worker.user == user and instance.user == worker.created_by:
            instance.delete()
            return

        raise PermissionDenied("No tienes permiso para eliminar esta cita.")

class UploadPDF(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, worker_pk, *args, **kwargs):
        worker = get_object_or_404(Worker, pk=worker_pk)
        is_admin = request.user.groups.filter(name='Admin').exists()
        file = request.FILES.get('file')

        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_url = fs.url(filename)

        pdf_registro = PDFRegistro.objects.create(
            worker=worker,
            file=file,
            created_by=request.user,
            is_admin_upload=is_admin
        )

        return Response({'message': 'PDF subido correctamente', 'file_url': file_url}, status=status.HTTP_200_OK)

class GetPDFs(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get(self, request, worker_pk, *args, **kwargs):
        worker = get_object_or_404(Worker, pk=worker_pk)
        pdf_registros = PDFRegistro.objects.filter(worker=worker)

        admin_pdfs = pdf_registros.filter(is_admin_upload=True)
        worker_pdfs = pdf_registros.filter(is_admin_upload=False)

        paginator_admin = self.pagination_class()
        paginator_worker = self.pagination_class()

        admin_pdfs_paginated = paginator_admin.paginate_queryset(admin_pdfs, request)
        worker_pdfs_paginated = paginator_worker.paginate_queryset(worker_pdfs, request)

        admin_serializer = PDFRegistroSerializer(admin_pdfs_paginated, many=True, context={'request': request})
        worker_serializer = PDFRegistroSerializer(worker_pdfs_paginated, many=True, context={'request': request})

        return Response({
            "admin_pdfs": admin_serializer.data,
            "worker_pdfs": worker_serializer.data,
            "total_pages_admin": paginator_admin.page.paginator.num_pages if admin_pdfs_paginated else 0,
            "total_pages_worker": paginator_worker.page.paginator.num_pages if worker_pdfs_paginated else 0,
            "current_page_admin": paginator_admin.page.number if admin_pdfs_paginated else 1,
            "current_page_worker": paginator_worker.page.number if worker_pdfs_paginated else 1,
        }, status=status.HTTP_200_OK)


class DeletePDF(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        pdf_id = kwargs.get("pdf_id")
        pdf_registro = get_object_or_404(PDFRegistro, id=pdf_id)

        # Solo el creador puede borrar su PDF
        if pdf_registro.created_by != request.user:
            return Response(
                {"error": "No tienes permiso para eliminar este archivo."},
                status=status.HTTP_403_FORBIDDEN
            )

        if pdf_registro.file:
            file_path = pdf_registro.file.path
            if os.path.exists(file_path):
                os.remove(file_path)

        pdf_registro.delete()
        return Response({"message": "PDF eliminado correctamente"}, status=status.HTTP_200_OK)
