from datetime import datetime, timedelta
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Citas
from .serializers import CitasSerializer

class CitasListCreateAPIView(ListCreateAPIView):
    """Vista para listar y crear citas"""
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Filtrar citas según el tipo de usuario y fecha."""
        user = self.request.user
        queryset = Citas.objects.select_related('patient', 'worker', 'user')

        # Obtener el tipo de filtro desde los parámetros de la URL
        filter_type = self.request.query_params.get('filter_type', 'hoy')

        today = datetime.today()
        if filter_type == 'hoy':
            start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif filter_type == 'mañana':
            tomorrow = today + timedelta(days=1)
            start_date = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif filter_type == 'semana':
            start_date = today - timedelta(days=today.weekday())  # Lunes de la semana actual
            end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
        elif filter_type == 'mes':
            start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = today.replace(month=today.month + 1 if today.month < 12 else 1, day=1, hour=0, minute=0) - timedelta(seconds=1)
        else:
            start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Filtrar por fecha
        queryset = queryset.filter(fecha__range=[start_date, end_date])

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
            return queryset.filter(worker__user=user)
        return queryset.filter(user=user)
