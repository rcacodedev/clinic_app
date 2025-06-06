from rest_framework import serializers
from .models import Cita, ConfiguracionPrecioCita
from patients.models import Paciente
from django.contrib.auth.models import Group

class CitaSerializer(serializers.ModelSerializer):
    paciente_id = serializers.IntegerField(write_only=True)  # ID recibido del frontend
    paciente = serializers.StringRelatedField(read_only=True)  # Para mostrar el nombre

    class Meta:
        model = Cita
        fields = '__all__'  # o lista explícita si prefieres

    def validate_paciente_id(self, value):
        request = self.context['request']
        user_group = request.user.groups.first()

        # Buscar al paciente con ese ID y del grupo del usuario
        try:
            paciente = Paciente.objects.get(id=value, grupo=user_group)
        except Paciente.DoesNotExist:
            raise serializers.ValidationError(
                "El paciente no pertenece al mismo grupo que el usuario o no existe."
            )
        return value

    def create(self, validated_data):
        paciente_id = validated_data.pop('paciente_id')
        user_group = self.context['request'].user.groups.first()
        paciente = Paciente.objects.get(id=paciente_id, grupo=user_group)
        validated_data['paciente'] = paciente
        return super().create(validated_data)

    def update(self, instance, validated_data):
        paciente_id = validated_data.pop('paciente_id', None)
        if paciente_id:
            user_group = self.context['request'].user.groups.first()
            paciente = Paciente.objects.get(id=paciente_id, grupo=user_group)
            validated_data['paciente'] = paciente
        return super().update(instance, validated_data)

class ConfiguracionPrecioCitaSerializer(serializers.ModelSerializer):
    precio_global = serializers.DecimalField(max_digits=10, decimal_places=2, default=25)

    class Meta:
        model = ConfiguracionPrecioCita
        fields = ["precio_global"]