from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Patient, PatientDocument
from .serializers import PatientSerializer, PatientDocumentSerializer

# Listar y Crear Pacientes
class PatientListCreateView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user  # Obtener al usuario que realiza la consulta
        search_term = self.request.query_params.get('search', None)

        # Inicializar queryset con todos los pacientes
        queryset = Patient.objects.all()

        # Filtrar pacientes por grupo(s) del usuario
        relevant_groups = user.groups.exclude(name='Admin')  # Excluimos el grupo admin

        if relevant_groups.exists():
            # Si el usuario pertenece a un grupo relevante, filtramos los pacientes por ese/estos grupos
            queryset = queryset.filter(group__in=relevant_groups).distinct()
        else:
            queryset = queryset.none()  # Si el usuario no tiene grupos relevantes, no mostramos pacientes

        # Filtrado por término de búsqueda, si existe
        if search_term:
            queryset = queryset.filter(
                Q(nombre__icontains=search_term) |
                Q(primer_apellido__icontains=search_term) |
                Q(segundo_apellido__icontains=search_term)
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        # Asociamos el paciente al grupo del usuario que lo crea (excluyendo "admin")
        relevant_group = user.groups.exclude(name='Admin').first()  # Tomamos el primer grupo no "admin"

        if relevant_group:
            # Si el usuario pertenece a un grupo, guardamos el paciente con ese grupo
            serializer.save(group=relevant_group)  # Asociamos el grupo al paciente
        else:
            # Si el usuario no tiene grupo, asociamos el paciente sin grupo (o con grupo None)
            serializer.save(group=None)

# Obtener, Actualizar y Eliminar Pacientes
class PatientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Paciente eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)

# Vista para subir el PDF firmado
class UploadSignedPDFView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, pk, *args, **kwargs):
        patient = get_object_or_404(Patient, pk=pk)

        if not any(f in request.FILES for f in ['pdf_firmado_general', 'pdf_firmado_menor', 'pdf_firmado_inyecciones']):
            return JsonResponse({"error": "No se ha encontrado ningún archivo PDF válido para subir."}, status=400)

        file_fields = {
            "pdf_firmado_general": "paciente_{}_proteccion_datos.pdf",
            "pdf_firmado_menor": "paciente_{}_consentimiento_menor.pdf",
            "pdf_firmado_inyecciones": "paciente_{}_consentimiento_medicina_invasiva.pdf"
        }

        saved_files = {}

        for field_name, file_name_template in file_fields.items():
            if field_name in request.FILES:
                file = request.FILES[field_name]

                if not file.name.endswith('.pdf'):
                    return JsonResponse({"error": "El archivo debe ser un PDF."}, status=400)

                pdf_name = file_name_template.format(pk)

                # Subir el archivo a S3 y guardarlo en el campo correspondiente
                setattr(patient, field_name, file)  # Sube el archivo directamente a S3 al asignar al campo
                patient.save()

                # Obtener la URL del archivo guardado en S3
                file_url = patient.__getattribute__(field_name).url

                saved_files[field_name] = file_url

        return JsonResponse({
            "message": "PDF(s) guardado(s) correctamente",
            "pdf_urls": saved_files
        })

# Subir documentos al paciente y listar
class PatientDocumentListCreateView(generics.ListCreateAPIView):
    queryset = PatientDocument.objects.all()
    serializer_class = PatientDocumentSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtra los documentos por paciente si se proporciona id"""
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return PatientDocument.objects.filter(patient_id=patient_id)
        return PatientDocument.objects.all()

    def perform_create(self, serializer):
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Eliminar documento del paciente
class PatientDocumentDeleteView(generics.DestroyAPIView):
    queryset = PatientDocument.objects.all()
    serializer_class = PatientDocumentSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        document = get_object_or_404(PatientDocument, pk=pk)

        if document.file:
            document.file.delete(save=False)

        document.delete()
        return Response({"message": "Documento eliminado correctamente"}, status=status.HTTP_204_NO_CONTENT)