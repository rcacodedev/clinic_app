from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import IntegrityError
from .models import Worker
from .serializers import WorkerSerializer
from citas.models import Citas  # Importar modelo de citas
from citas.serializers import CitasSerializer # Importar serializer de citas
from backend.permissions import IsAdmin  # Tu permiso personalizado para administradores
import logging

logger = logging.getLogger(__name__)


# Vista para listar y crear trabajadores
class WorkerListCreateView(ListCreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        # Filtrar trabajadores por el usuario que los creó (admin)
        return Worker.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        # Asignar el creador al trabajador y pasar confirm_password al serializer
        serializer.save(created_by=self.request.user)


# Vista para obtener, actualizar y eliminar un trabajador
class WorkerDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Asegurarte de que los trabajadores son solo los creados por el admin actual
        return Worker.objects.filter(created_by=self.request.user)

    def perform_update(self, serializer):
        # Verificar permisos antes de actualizar
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