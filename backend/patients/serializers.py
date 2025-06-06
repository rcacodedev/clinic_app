from rest_framework import serializers
from .models import Paciente, PacienteDocumentacion
from citas.serializers import CitaSerializer

class PacienteDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PacienteDocumentacion
        fields = ['id', 'archivo', 'upload_at']
        read_only_fields = ['id', 'upload_at']


class PacienteSerializer(serializers.ModelSerializer):
    citas = CitaSerializer(many=True, read_only=True)
    documents = PacienteDocumentoSerializer(source='documentos', many=True, read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    pdf_urls = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    grupo = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Paciente
        fields = [
            'id',
            'uuid',
            'nombre',
            'primer_apellido',
            'segundo_apellido',
            'email',
            'phone',
            'fecha_nacimiento',
            'dni',
            'address',
            'city',
            'code_postal',
            'country',
            'alergias',
            'patologias',
            'notas',
            'grupo',
            'group_name',
            'created_at',
            'created_at_formatted',
            'pdf_firmado_general',
            'pdf_firmado_menor',
            'pdf_firmado_inyecciones',
            'pdf_urls',
            'documents',
            'citas',
        ]
        read_only_fields = [
            'id',
            'uuid',
            'created_at',
            'created_at_formatted',
            'pdf_urls',
            'group_name',
            'documents',
            'citas',
            'grupo',
        ]

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y')

    def get_pdf_urls(self, obj):
        return {
            "pdf_firmado_general": self._get_file_url(obj.pdf_firmado_general),
            "pdf_firmado_menor": self._get_file_url(obj.pdf_firmado_menor),
            "pdf_firmado_inyecciones": self._get_file_url(obj.pdf_firmado_inyecciones),
        }

    def _get_file_url(self, filefield):
        if filefield and hasattr(filefield, 'url'):
            return filefield.url
        return None

    def get_group_name(self, obj):
        return obj.grupo.name if obj.grupo else None
