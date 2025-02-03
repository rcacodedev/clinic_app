from rest_framework import serializers
from .models import Worker
from citas.models import Citas
from patients.models import Patient
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from django.core.validators import RegexValidator

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)  # Campo solo para validación

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True},  # Para que no se exponga la contraseña
        }

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise ValidationError({"password": "Las contraseñas no coinciden."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Eliminar confirm_password antes de crear el usuario
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user

class AppointmentSerializer(serializers.ModelSerializer):
    worker = serializers.PrimaryKeyRelatedField(queryset=Worker.objects.all(), source='worker.pk')  # Asociamos el trabajador con la cita
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), source='patient.pk')

    class Meta:
        model = Citas
        fields = ['id', 'worker', 'patient', 'fecha', 'comenzar', 'finalizar', 'descripcion']

    def create(self, validated_data):
        # Extraer los datos de la cita validados
        worker = validated_data.pop('worker')  # Trabajador que recibe la cita
        patient = validated_data.pop('patient')  # Paciente asignado a la cita

        # Crear la cita
        cita = Citas.objects.create(worker=worker, patient=patient, **validated_data)

        return cita


class WorkerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    appointments = AppointmentSerializer(many=True, read_only=True)

    dni = serializers.CharField(
        validators=[
            RegexValidator(r'^\d{8}[A-Z]$', "El DNI debe tener el formato 12345678A.")
        ]
    )
    postal_code = serializers.CharField(
        validators=[
            RegexValidator(r'^\d{5}$', "El código postal debe ser un número de 5 dígitos.")
        ]
    )
    country = serializers.CharField(max_length=50)

    class Meta:
        model = Worker
        fields = [
            'id',
            'user',
            'branch',
            'created_by',
            'is_active',
            'appointments',
            'dni',
            'address',
            'postal_code',
            'country',
            'phone',
        ]
        read_only_fields = ['created_by']

    def create(self, validated_data):
        # Extraer datos del usuario
        user_data = validated_data.pop('user')

        # Crear el usuario
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Asegurarse de que los valores requeridos para el trabajador estén presentes
        validated_data['created_by'] = self.context['request'].user  # Asignar al creador el usuario actual
        validated_data['user'] = user  # Relacionar el trabajador con el usuario creado

        # Si no se pasa un valor para `branch`, `dni`, `address`, etc., se asignarán los valores por defecto
        validated_data.setdefault('branch', 'fisioterapia')  # Asignar un valor por defecto si no se proporciona
        validated_data.setdefault('dni', '12345678A')
        validated_data.setdefault('address', 'Sin dirección')
        validated_data.setdefault('postal_code', '00000')
        validated_data.setdefault('country', 'España')

        # Crear el trabajador
        worker = Worker.objects.create(**validated_data)
        return worker

    def validate(self, attrs):
        # Verificación adicional de la dirección si el país es España
        if attrs.get('country') == 'España' and not attrs.get('address'):
            raise ValidationError({"address": "La dirección es obligatoria para trabajadores en España."})
        return attrs



    def update(self, instance, validated_data):
        # Si no hay datos de 'user', no se actualiza el modelo User
        user_data = validated_data.pop('user', None)

        # Actualizamos los campos del Worker
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Si se han enviado datos para actualizar el User, los actualizamos
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        return instance