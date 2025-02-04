from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Citas
from .serializers import CitasSerializer

class CitasListCreateAPIView(ListCreateAPIView):
    """Vista para listar y crear citas"""
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar citas según el tipo de usuario."""
        user = self.request.user
        queryset = Citas.objects.select_related('patient', 'worker', 'user')
        if user.is_staff:
            return queryset.filter(worker__user=user)
        return queryset.filter(worker__user=user) | queryset.filter(user=user)

    def perform_create(self, serializer):
        """Guardar citas asociadas al usuario actual."""
        serializer.save(user=self.request.user)

class CitasDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar o eliminar una cita."""
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar citas según el tipo de usuario"""
        user = self.request.user
        queryset = Citas.objects.select_related('patient', 'worker', 'user')
        if user.is_staff:
            return queryset.filter(worker__user= user)
        return queryset.filter(user=user)


