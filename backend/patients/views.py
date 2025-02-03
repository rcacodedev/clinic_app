from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Patient
from .serializers import PatientSerializer

# Listar y Crear Pacientes
class PatientListCreateView(generics.ListCreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtro de búsqueda basado en parámetros
        search_term = self.request.query_params.get('search', None)
        queryset = super().get_queryset()
        if search_term:
            queryset = queryset.filter(
                Q(nombre__icontains=search_term) |
                Q(primer_apellido__icontains=search_term) |
                Q(segundo_apellido__icontains=search_term)
            )
        return queryset

# Obtener, Actualizar y Eliminar Pacientes
class PatientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Paciente eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
