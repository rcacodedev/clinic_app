from rest_framework import generics
from datetime import date
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils.timezone import now
from datetime import datetime
from .models import Note
from .serializers import NoteSerializer

# Paginación de las notas
class NotePagination(PageNumberPagination):
    page_size = 7
    page_size_query_param = 'page_size'
    max_page_size = 50

# Ordenamiento de notas:
# 1. Primero, notas importantes
# 2. Luego, notas con recordatorio en la fecha actual
# 3. Finalmente, las demás notas ordenadas por fecha de creación
def get_sorted_notes():
    today = now().date()
    return Note.objects.all().order_by(
        '-is_important',  # Notas importantes primero
        '-reminder_date',  # Luego, las que tienen recordatorio hoy
        '-created_at'  # Finalmente, las más recientes primero
    )

# Lista y creacion de notas
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    pagination_class = NotePagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_sorted_notes()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        reminder_date = data.get("reminder_date")

        if reminder_date:
            try:
                data["reminder_date"] = datetime.strptime(reminder_date, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Formato de fecha inválido"}, status=400)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
# Detalle, actualización y eliminacion de una nota
class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

# Filtrar notas por fecha recordatorio
class NotesByDateView(APIView):
    def get(self, request, date):
        notes = Note.objects.filter(reminder_date=date).order_by('-created_at')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

# Notas que deben recordarse hoy
class TodayNotesView(APIView):
    def get(self, request):
        today = date.today()
        notes = Note.objects.filter(created_at=today).order_by('-created_at')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)