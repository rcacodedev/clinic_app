from rest_framework import generics, permissions, serializers
from django.contrib.auth.models import User
from .models import Activity
from workers.models import Worker
from .serializers import ActivitySerializer, CreateActivitySerializer
from .permissions import IsAdminGroup

class ActivityListCreateView(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = CreateActivitySerializer
    permission_classes = [IsAdminGroup]

    def perform_create(self, serializer):
        monitor_id = self.request.data.get('monitor', None)
        monitor = None

        if monitor_id:
            try:
                monitor = User.objects.get(id=monitor_id)
            except User.DoesNotExist:
                raise serializers.ValidationError("El monitor seleccionado no es válido.")

        # Si se seleccionó un monitor, asegurarse de que sea un `Worker` del `User` actual, o el `User` mismo
        if monitor and not (monitor == self.request.user or Worker.objects.filter(user=monitor).exists()):
            raise serializers.ValidationError("El monitor seleccionado debe ser un 'Worker' creado por ti, o el propio 'User'.")

        # Guardamos la actividad con el monitor (si se seleccionó)
        serializer.save(user=self.request.user, monitor=monitor)

class ActivityRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    # GET: Obtener detalles de una actividad específica.
    # PUT/PATCH: Actualizar una actividad (solo Admin).
    # DELETE: Eliminar una actividad (solo Admin).

    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAdminGroup]

    def get_object(self):
        # Aquí obtenemos la actividad normalmente
        activity = super().get_object()

        # Si necesitas trabajar con el monitor, accedes directamente
        monitor = activity.monitor
        if monitor is None:
            return Response({'detail': 'No monitor assigned.'}, status=404)

        return activity  # Ya no necesitamos verificar si es un "Worker" o no.