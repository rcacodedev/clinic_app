from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils.timezone import now
from datetime import date, datetime
from .models import Note
from .serializers import NoteSerializer
from django.db.models import Case, When, Value, IntegerField, ExpressionWrapper, F
from django.db.models.functions import Abs

# Paginación de las notas
class CustomPagination(PageNumberPagination):
    page_size = 5

    def get_paginated_response(self, data):
        return Response({
            'total_pages': self.page.paginator.num_pages,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


# Ordenamiento de notas:
# 1. Primero, notas importantes
# 2. Luego, notas con recordatorio en la fecha actual
# 3. Finalmente, las demás notas ordenadas por fecha de creación


def get_sorted_notes(queryset=None):
    if queryset is None:
        queryset = Note.objects.all()

    today = date.today()

    return queryset.annotate(
        # 1. Asigna prioridad a las notas importantes
        importancia_orden=Case(
            When(is_important=True, then=Value(1)),  # Prioridad 0 para importantes
            default=Value(2),  # Prioridad 1 para las demás
            output_field=IntegerField()
        ),
    ).order_by(
        'importancia_orden',  # Primero las importantes
        'reminder_date',       # Luego por fecha de recordatorio
        'created_at'           # Finalmente, por fecha de creación
    )

# Función para validar y convertir fecha de recordatorio
def parse_reminder_date(reminder_date):
    try:
        reminder_date_obj = datetime.strptime(reminder_date, "%Y-%m-%d").date()
        if reminder_date_obj < date.today():
            raise ValueError("La fecha de recordatorio no puede ser en el pasado.")
        return reminder_date_obj
    except ValueError as e:
        raise ValueError(f"Formato de fecha inválido: {str(e)}")

# Lista y creación de notas
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    pagination_class = CustomPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Note.objects.all()

        # Filtros opcionales
        is_important = self.request.query_params.get('is_important', None)
        reminder_date = self.request.query_params.get('reminder_date', None)

        if is_important is not None:
            queryset = queryset.filter(is_important=is_important.lower() == 'true')

        if reminder_date:
            try:
                reminder_date_obj = parse_reminder_date(reminder_date)
                queryset = queryset.filter(reminder_date=reminder_date_obj)
            except ValueError as e:
                raise ValidationError(str(e))

        return get_sorted_notes(queryset)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        reminder_date = data.get("reminder_date")

        if reminder_date:
            try:
                data["reminder_date"] = parse_reminder_date(reminder_date)
            except ValueError as e:
                return Response({"error": str(e)}, status=400)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

# Detalle, actualización y eliminación de una nota
class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

# Filtrar notas por fecha de recordatorio
class NotesByDateView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            # Convertir la fecha recibida a un objeto datetime
            date_obj = datetime.strptime(self.kwargs['date'], "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Formato de fecha inválido"}, status=400)

        return Note.objects.filter(reminder_date=date_obj).order_by('-created_at')

# Notas que deben recordarse hoy
class TodayNotesView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        today = date.today()
        # Usar __date para comparar solo la fecha, no la hora
        return Note.objects.filter(created_at__date=today).order_by('-created_at')
