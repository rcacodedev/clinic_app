from rest_framework import generics, permissions
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from .models import Activity
from .serializers import ActivitySerializer, CreateActivitySerializer
from .permissions import IsAdminGroup


class ActivityListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminGroup]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateActivitySerializer
        return ActivitySerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        monitor_id = self.request.data.get('monitor')
        monitor = None
        if monitor_id:
            try:
                monitor = User.objects.get(id=monitor_id)
            except User.DoesNotExist:
                raise NotFound(detail="Monitor no encontrado.")
        serializer.save(user=self.request.user, monitor=monitor)


class ActivityRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ActivitySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminGroup()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Solo las actividades del usuario autenticado
        return Activity.objects.filter(user=self.request.user)

    def get_object(self):
        obj = super().get_object()
        if self.request.method == 'GET' and obj.monitor is None:
            raise NotFound(detail="No se ha asignado un monitor a esta actividad.")
        return obj
