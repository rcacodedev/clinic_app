from rest_framework import serializers
from .models import Activity
from patients.models import Paciente
from workers.models import Worker
from django.contrib.auth.models import User


class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ['id', 'name', 'email', 'phone']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']


class ActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    patients = serializers.PrimaryKeyRelatedField(
        source='pacientes',
        queryset=Paciente.objects.all(),
        many=True
    )
    monitor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    monitor_detail = UserSerializer(source='monitor', read_only=True)

    recurrence_days = serializers.ListField(
        child=serializers.ChoiceField(
            choices=[(day, day) for day in ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']]
        ),
        required=False
    )

    start_time = serializers.TimeField(default="00:00")
    end_time = serializers.TimeField(default="00:00")
    start_date = serializers.DateField(format="%Y-%m-%d", required=False)

    class Meta:
        model = Activity
        fields = [
            'id',
            'name',
            'description',
            'start_date',
            'start_time',
            'end_time',
            'recurrence_days',
            'user',
            'patients',
            'monitor',
            'monitor_detail',
            'precio'
        ]

    def validate(self, data):
        start = data.get('start_time', getattr(self.instance, 'start_time', None))
        end = data.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and start >= end:
            raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de finalización.")
        return data

    def validate_recurrence_days(self, value):
        if len(set(value)) != len(value):
            raise serializers.ValidationError("No se permiten días duplicados.")
        return value

    def validate_precio(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def create(self, validated_data):
        pacientes_data = validated_data.pop('pacientes', [])
        activity = super().create(validated_data)
        activity.pacientes.set(pacientes_data)
        return activity

    def update(self, instance, validated_data):
        pacientes_data = validated_data.pop('pacientes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if pacientes_data is not None:
            instance.pacientes.set(pacientes_data)
        instance.save()
        return instance


class CreateActivitySerializer(serializers.ModelSerializer):
    monitor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Activity
        fields = ['id', 'name', 'description', 'start_date', 'monitor']

    def create(self, validated_data):
        return Activity.objects.create(**validated_data)
