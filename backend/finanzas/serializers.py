from rest_framework import serializers
from django.db import models
from finanzas.models import Transaccion, ConfiguracionFinanzas
from citas.models import Citas
from userinfo.models import UserInfo
from patients.models import Patient
from actividades.models import Activity
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from datetime import datetime


class UserInfoSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    class Meta:
        model = UserInfo
        fields = [ 'address',  'dni', 'postal_code', 'city', 'country', 'segundo_apellido', 'first_name', 'last_name']

class PatientSerializers(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['nombre', 'primer_apellido', 'segundo_apellido', 'dni', 'address', 'city', 'code_postal', 'country']

class CitaSerializers(serializers.ModelSerializer):
    patient = PatientSerializers()


    class Meta:
        model = Citas
        fields = ['patient', 'fecha', 'descripcion', 'precio', 'cotizada']

    def validate_precio(self, value):
        if value < 0:
            raise ValidationError("El precio de la cita no puede ser negativo.")
        return value

    def validate(self, data):
        if data.get('fecha') > datetime.now():
            raise ValidationError("La fecha de la cita no puede ser en el futuro.")
        return data

class ActividadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['precio']

    def validate_precio(self, value):
        if value < 0:
            raise ValidationError("El precio de la actividad no puede ser negativo.")
        return value

class ConfiguracionFinanzasSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionFinanzas
        fields = ['id', 'precio_cita_base', 'precio_actividad_base', 'ultima_actualizacion']

    def validate_precio_cita_base(self, value):
        if value < 0:
            raise ValidationError("El precio base de la cita no puede ser negativo.")
        return value

class TransaccionSerializer(serializers.ModelSerializer):
    cita = CitaSerializers()
    user = UserInfoSerializer()

    class Meta:
        model = Transaccion
        fields = ['id', 'tipo', 'monto', 'descripcion', 'fecha', 'cita', 'user', 'url', 'cita_registrada']

    def validate_monto(self, value):
        if value <= 0:
            raise ValidationError("El monto de la transacción debe ser mayor que cero.")
        return value

    def validate_tipo(self, value):
        if value not in ['INGRESO', 'GASTO']:
            raise ValidationError("El tipo de transacción debe ser 'INGRESO' o 'GASTO'.")
        return value

    def validate(self, data):
        cita = data.get('cita')
        if not cita:
            raise ValidationError("Debe asociar una cita válida.")
        if cita.precio <= 0:
            raise ValidationError("El precio de la cita asociada debe ser mayor que cero.")

        usuario = data.get('user')
        if not usuario:
            raise ValidationError("Debe asociar un usuario válido.")
        return data
