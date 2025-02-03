from rest_framework import serializers
from .models import Patient
from citas.serializers import CitasSerializer

class PatientSerializer(serializers.ModelSerializer):
    citas = CitasSerializer(many=True, read_only=True)
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('created_at', 'citas')  # Evitar que sean modificables

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y')
