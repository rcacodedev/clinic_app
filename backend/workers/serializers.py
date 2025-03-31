from django.contrib.auth.models import Group
from rest_framework import serializers
from .models import Worker, PDFRegistro
from citas.models import Citas
from patients.models import Patient
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from userinfo.serializers import UserInfoSerializer

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)  # Campo solo para validación
    userInfo = UserInfoSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'confirm_password', 'userInfo']
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

    def update(self, instance, validated_data):
        userinfo_data = validated_data.pop('userinfo', None)  # Extraer datos de UserInfo

        # Actualizar los campos del usuario
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Si hay datos para UserInfo, actualizarlos o crearlos
        if userinfo_data:
            userinfo, created = instance.userinfo.get_or_create(user=instance)
            for attr, value in userinfo_data.items():
                setattr(userinfo, attr, value)
            userinfo.save()

        return instance

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]  # Incluir nombre del grupo

class AppointmentSerializer(serializers.ModelSerializer):
    worker = serializers.PrimaryKeyRelatedField(queryset=Worker.objects.all(), source='worker.pk')  # Asociamos el trabajador con la cita
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), source='patient.pk')

    class Meta:
        model = Citas
        fields = ['id', 'worker', 'patient', 'fecha', 'comenzar', 'finalizar', 'descripcion', 'cotizada']

    def create(self, validated_data):
        # Extraer los datos de la cita validados
        worker = validated_data.pop('worker')  # Trabajador que recibe la cita
        patient = validated_data.pop('patient')  # Paciente asignado a la cita

        # Crear la cita
        cita = Citas.objects.create(worker=worker, patient=patient, **validated_data)

        return cita


class PDFRegistroSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = PDFRegistro
        fields = ['file', 'created_by', 'is_admin_upload']

class WorkerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    appointments = AppointmentSerializer(many=True, read_only=True)
    groups = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True)
    pdf_registros = PDFRegistroSerializer(many=True, read_only=True)

    class Meta:
        model = Worker
        fields = [
            'id',
            'user',
            'created_by',
            'appointments',
            'groups',
            'color',
            'pdf_registros',
        ]
        read_only_fields = ['created_by']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        groups_data = validated_data.pop('groups', [])

        # Creamos el usuario asociado si no existe
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Asignamos los grupos al usuario
        if groups_data:
            user.groups.set(groups_data)
            user.save()

        # Asignamos el trabajador
        validated_data['created_by'] = self.context['request'].user
        validated_data['user'] = user

        worker = Worker.objects.create(**validated_data)
        return worker

    def validate(self, attrs):
        # Verificación adicional de la dirección si el país es España
        if attrs.get('country') == 'España' and not attrs.get('address'):
            raise ValidationError({"address": "La dirección es obligatoria para trabajadores en España."})
        return attrs

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        groups_data = validated_data.pop('groups', None)

        # Actualizamos los campos del Worker
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Actualizamos los grupos si se proporcionan
        if groups_data is not None:
            instance.groups.set(groups_data)

        # Actualizar el usuario si se envían datos
        if user_data:
            user = instance.user
            userinfo_data = user_data.pop('userinfo', None)  # Extraer datos de UserInfo
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

            # Si hay datos para UserInfo, actualizarlos o crearlos
            if userinfo_data:
                userinfo, created = user.userinfo.get_or_create(user=user)
                for attr, value in userinfo_data.items():
                    setattr(userinfo, attr, value)
                userinfo.save()

        return instance