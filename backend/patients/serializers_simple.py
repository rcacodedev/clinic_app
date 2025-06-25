# patients/serializers_simple.py

from rest_framework import serializers
from .models import Paciente

class PacienteCitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = ['id', 'nombre', 'primer_apellido', 'segundo_apellido', 'phone']
