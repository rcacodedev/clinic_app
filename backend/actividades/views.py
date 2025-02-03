from rest_framework import generics, permissions
from .models import Activity
from .serializers import ActivitySerializer, CreateActivitySerializer
from .permissions import IsAdminGroup

class ActivityListCreateView(generics.ListCreateAPIView):
    #GET: Listar todas las actividades.
    #POST:Crear una nueva actividad (solo Admin).

    queryset = Activity.objects.all()
    serializer_class = CreateActivitySerializer
    permission_classes = [IsAdminGroup]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ActivityRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    # GET: Obtener detalles de una actividad específica.
    # PUT/PATCH: Actualizar una actividad (solo Admin).
    # DELETE: Eliminar una actividad (solo Admin).

    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAdminGroup]