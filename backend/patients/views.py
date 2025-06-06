from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Paciente, PacienteDocumentacion
from .serializers import PacienteSerializer, PacienteDocumentoSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class PatientPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100

# Listar y Crear Pacientes
class PatientListCreateView(generics.ListCreateAPIView):
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PatientPagination

    def get_queryset(self):
        user = self.request.user  # Obtener al usuario que realiza la consulta
        search_term = self.request.query_params.get('search', None)

        # Inicializar queryset con todos los pacientes
        queryset = Paciente.objects.all()

        # Filtrar pacientes por grupo(s) del usuario
        relevant_groups = user.groups.exclude(name='Admin')  # Excluimos el grupo admin

        if relevant_groups.exists():
            # Si el usuario pertenece a un grupo relevante, filtramos los pacientes por ese/estos grupos
            queryset = queryset.filter(grupo__in=relevant_groups).distinct()
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
            serializer.save(grupo=relevant_group)  # Asociamos el grupo al paciente
        else:
            # Si el usuario no tiene grupo, asociamos el paciente sin grupo (o con grupo None)
            serializer.save(grupo=None)

# Obtener, Actualizar y Eliminar Pacientes
class PatientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Paciente eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)

# Vista para subir el PDF firmado

class UploadSignedPDFView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        # Obtener al paciente con el id 'pk' (si no existe, 404)
        patient = get_object_or_404(Paciente, pk=pk)

        if not request.FILES:
            return JsonResponse({"error": "No se ha subido ningún archivo."}, status=400)

        # Asegúrate de que todos los archivos subidos sean PDFs
        for file in request.FILES.values():
            if not file.name.endswith('.pdf'):
                return JsonResponse({"error": "El archivo debe ser un PDF."}, status=400)

        # Diccionario con los campos de archivo del modelo Patient
        file_fields = {
            "pdf_firmado_general": "paciente_{}_LPD.pdf",
            "pdf_firmado_menor": "paciente_{}_CM.pdf",
            "pdf_firmado_inyecciones": "paciente_{}_CMI.pdf"
        }

        saved_files = {}

        # Iterar sobre los archivos y los campos esperados en el modelo
        for field_name, file_name_template in file_fields.items():
            if field_name in request.FILES:
                file = request.FILES[field_name]

                # Verifica nuevamente que el archivo sea un PDF
                if not file.name.endswith('.pdf'):
                    return JsonResponse({"error": "El archivo debe ser un PDF."}, status=400)

                # Genera el nombre del archivo para el paciente
                pdf_name = file_name_template.format(pk)

                # Asigna el archivo al campo correspondiente del modelo (usando un FileField en el modelo)
                if field_name == "pdf_firmado_general":
                    patient.pdf_firmado_general = file
                elif field_name == "pdf_firmado_menor":
                    patient.pdf_firmado_menor = file
                elif field_name == "pdf_firmado_inyecciones":
                    patient.pdf_firmado_inyecciones = file

                # Guarda el modelo después de asignar los archivos
                patient.save()

                # Obtener la URL del archivo guardado en S3 o en el almacenamiento configurado
                file_url = getattr(patient, field_name).url

                # Añadir la URL del archivo al diccionario de archivos guardados
                saved_files[field_name] = file_url

        # Retornar la respuesta con las URLs de los PDFs guardados
        return Response({"message": "PDF(s) guardado(s) correctamente", "pdf_urls": saved_files})

# Subir documentos al paciente y listar
class PatientDocumentListCreateView(generics.ListCreateAPIView):
    queryset = PacienteDocumentacion.objects.all()
    serializer_class = PacienteDocumentoSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return PacienteDocumentacion.objects.filter(paciente_id=patient_id)
        return PacienteDocumentacion.objects.all()

    def perform_create(self, serializer):
        patient_id = self.request.query_params.get('patient_id')
        if not patient_id:
            raise serializers.ValidationError({"patient_id": "Este campo es requerido."})
        paciente = get_object_or_404(Paciente, pk=patient_id)
        serializer.save(paciente=paciente)


# Eliminar documento del paciente
class PatientDocumentDeleteView(generics.DestroyAPIView):
    queryset = PacienteDocumentacion.objects.all()
    serializer_class = PacienteDocumentoSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        document = get_object_or_404(PacienteDocumentacion, pk=pk)

        if document.archivo:
            document.archivo.delete(save=False)

        document.delete()
        return Response({"message": "Documento eliminado correctamente"}, status=status.HTTP_204_NO_CONTENT)