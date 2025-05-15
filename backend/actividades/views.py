from rest_framework import generics, permissions
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Activity
from .serializers import ActivitySerializer, CreateActivitySerializer
from .permissions import IsAdminGroup
from rest_framework.exceptions import NotFound

class ActivityListCreateView(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    permission_classes = [IsAdminGroup]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateActivitySerializer
        return ActivitySerializer  # Este devuelve el monitor como objeto

    def perform_create(self, serializer):
        monitor_id = self.request.data.get('monitor', None)
        monitor = None

        if monitor_id:
            monitor = get_object_or_404(User, id=monitor_id)

        serializer.save(user=self.request.user, monitor=monitor)

class ActivityRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminGroup()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        activity = super().get_object()
        if activity.monitor is None:
            raise NotFound(detail='No se ha asignado un monitor a esta actividad.')
        return activity