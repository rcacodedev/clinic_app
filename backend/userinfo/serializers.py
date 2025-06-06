from rest_framework import serializers
from .models import UserInfo
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'username' : {'read_only': True}
        }

class UserInfoSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=False)

    class Meta:
        model = UserInfo
        fields = ['user', 'address', 'phone', 'fecha_nacimiento', 'nombre', 'primer_apellido', 'dni', 'postal_code', 'city', 'country', 'segundo_apellido', 'photo', 'whatsapp_business_number', 'twilio_whatsapp_service_sid', 'twilio_integration_verified']


    def update(self, instance, validated_data):
        validated_data.pop('photo', None)  # 👈 Ignora si viene 'photo'

        user_data = validated_data.pop('user', {})
        for field, value in user_data.items():
            setattr(instance.user, field, value)
        instance.user.save()

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
