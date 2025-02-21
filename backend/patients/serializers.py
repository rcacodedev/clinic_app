from rest_framework import serializers
from .models import Patient
from citas.serializers import CitasSerializer

class PatientSerializer(serializers.ModelSerializer):
    citas = CitasSerializer(many=True, read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    pdf_urls = serializers.SerializerMethodField()  # Nuevo campo
    group_name = serializers.SerializerMethodField()  # Campo para mostrar el nombre del grupo

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('created_at', 'citas', 'pdf_firmado_general', 'pdf_firmado_menor', 'pdf_firmado_inyecciones')

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y')

    def get_pdf_urls(self, obj):
        """ Devuelve un diccionario con las URLs de los PDFs """
        return {
            "pdf_firmado_general": obj.pdf_firmado_general.url if obj.pdf_firmado_general and hasattr(obj.pdf_firmado_general, 'url') else None,
            "pdf_firmado_menor": obj.pdf_firmado_menor.url if obj.pdf_firmado_menor and hasattr(obj.pdf_firmado_menor, 'url') else None,
            "pdf_firmado_inyecciones": obj.pdf_firmado_inyecciones.url if obj.pdf_firmado_inyecciones and hasattr(obj.pdf_firmado_inyecciones, 'url') else None
        }

    def get_group_name(self, obj):
        """ Retorna el nombre del grupo del paciente, si tiene uno """
        return obj.group.name if obj.group else None