from django.urls import path
from .views import PatientListCreateView, PatientRetrieveUpdateDestroyView

urlpatterns = [
    # Ruta listar y crear pacientes
    path('', PatientListCreateView.as_view(), name="patient-list-create"),
    # Ruta para obtener, actualizar y eliminar un paciente
    path('<int:pk>/', PatientRetrieveUpdateDestroyView.as_view(), name="patient-detail"),
]
