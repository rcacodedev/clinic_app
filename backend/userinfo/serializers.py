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
    user = UserSerializer()

    class Meta:
        model = UserInfo
        fields = ['user', 'address', 'phone', 'fecha_nacimiento', 'dni', 'postal_code', 'city', 'country', 'segundo_apellido', 'photo', 'whatsapp_token', 'phone_number_id']

    def update(self, instance, validated_data):
        # Extraer datos de 'user'
        user_data = validated_data.pop('user', {})
        for field, value in user_data.items():
            setattr(instance.user, field, value)
        instance.user.save()

        # Actualizar los campos de userInfo
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
