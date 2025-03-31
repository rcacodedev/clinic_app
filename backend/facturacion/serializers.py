from rest_framework import serializers
from .models import Factura, ConfiguracionFactura

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = "__all__"

class ConfiguracionFacturaSerializer(serializers.ModelSerializer):
    numero_inicial = serializers.IntegerField()
    class Meta:
        model = ConfiguracionFactura
        fields = ["numero_inicial"]