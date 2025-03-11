from rest_framework import serializers
from .models import Activity
from patients.models import Patient
from workers.models import Worker
from django.contrib.auth.models import User

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'nombre', 'primer_apellido', 'segundo_apellido', 'phone', 'email']

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ['id', 'name', 'email', 'phone']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']

class ActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Usuario que crea la actividad
    patients = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), many=True)
    monitor = serializers.PrimaryKeyRelatedField(queryset=Worker.objects.all(), required=False)

    # Campos adicionales que ahora vas a incluir
    recurrence_days = serializers.ListField(
        child=serializers.ChoiceField(choices=[(day, day) for day in ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']])
    )
    start_time = serializers.TimeField(default="00:00")
    start_date = serializers.DateField(format="%Y-%m-%d", required=False)  # Fecha de inicio
    end_time = serializers.TimeField(default="00:00")

    class Meta:
        model = Activity
        fields = ['id', 'name', 'description', 'start_date', 'start_time', 'end_time', 'recurrence_days', 'user', 'patients', 'monitor', 'precio']

    def create(self, validated_data):
        patients_data = validated_data.pop('patients')
        activity = super().create(validated_data)
        activity.patients.set(patients_data)  # Asignamos los pacientes a la actividad
        return activity

    def update(self, instance, validated_data):
        patients_data = validated_data.pop('patients', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if patients_data is not None:
            instance.patients.set(patients_data)
        instance.save()
        return instance


class CreateActivitySerializer(serializers.ModelSerializer):
    monitor = serializers.PrimaryKeyRelatedField(queryset=Worker.objects.all())

    class Meta:
        model = Activity
        fields = ['id','name', 'description','start_date', 'monitor']


    def create(self, validated_data):
        return Activity.objects.create(**validated_data)