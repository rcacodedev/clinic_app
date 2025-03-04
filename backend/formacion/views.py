from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Formacion
from .serializers import FormacionSerializer

# Listar y crear la formacion del usuario
class FormacionListCreateView(generics.ListCreateAPIView):
    serializer_class = FormacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Formacion.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Ver, actualizar o eliminar formacion
class FormacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FormacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Formacion.objects.filter(user=self.request.user)


