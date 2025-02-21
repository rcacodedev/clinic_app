from django.urls import path
from .views import PatientListCreateView, PatientRetrieveUpdateDestroyView, UploadSignedPDFView

urlpatterns = [
    # Ruta listar y crear pacientes
    path('', PatientListCreateView.as_view(), name="patient-list-create"),
    # Ruta para obtener, actualizar y eliminar un paciente
    path('<int:pk>/', PatientRetrieveUpdateDestroyView.as_view(), name="patient-detail"),
    # Ruta para subir el PDF firmado
    path('<int:pk>/upload-signed-pdf/', UploadSignedPDFView.as_view(), name="upload-signed-pdf"),
]
