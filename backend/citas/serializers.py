from rest_framework import serializers
from .models import Cita, ConfiguracionPrecioCita
from patients.models import Paciente
from django.contrib.auth.models import Group

class CitaSerializer(serializers.ModelSerializer):
    paciente_id = serializers.IntegerField(write_only=True)
    paciente = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Cita
        fields = '__all__'

    def validate_paciente_id(self, value):
        request = self.context['request']
        user = request.user
        user_groups = user.groups.exclude(name='Admin')

        if not user_groups.exists():
            raise serializers.ValidationError("El usuario no pertenece a ningún grupo válido.")

        # Comprobar que el paciente existe y está en alguno de los grupos del usuario
        try:
            paciente = Paciente.objects.get(id=value, grupo__in=user_groups)
        except Paciente.DoesNotExist:
            raise serializers.ValidationError("El paciente no pertenece al mismo grupo que el usuario o no existe.")

        # Guardar la instancia para evitar consultar dos veces en create
        self.context['paciente_obj'] = paciente
        return value

    def create(self, validated_data):
        paciente = self.context.get('paciente_obj')
        if not paciente:
            # En caso que no venga del validate_paciente_id (por si acaso)
            paciente_id = validated_data.pop('paciente_id')
            user_groups = self.context['request'].user.groups.exclude(name='Admin')
            paciente = Paciente.objects.get(id=paciente_id, grupo__in=user_groups)

        validated_data['paciente'] = paciente
        validated_data.pop('paciente_id', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        paciente_id = validated_data.pop('paciente_id', None)
        if paciente_id:
            user_groups = self.context['request'].user.groups.exclude(name='Admin')
            paciente = Paciente.objects.get(id=paciente_id, grupo__in=user_groups)
            validated_data['paciente'] = paciente
        return super().update(instance, validated_data)

class ConfiguracionPrecioCitaSerializer(serializers.ModelSerializer):
    precio_global = serializers.DecimalField(max_digits=10, decimal_places=2, default=25)

    class Meta:
        model = ConfiguracionPrecioCita
        fields = ["precio_global"]