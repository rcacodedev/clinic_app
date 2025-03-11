from django.contrib.auth.models import User, Group  # Importa el modelo Group
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    group = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'group']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        group_name = validated_data.pop('group', None)  # Extraemos el grupo, si existe
        user = User.objects.create_user(**validated_data)

        if group_name:
            try:
                group = Group.objects.get(name=group_name)  # Intentamos obtener el grupo
                user.groups.add(group)  # Asignamos el grupo al usuario
            except Group.DoesNotExist:
                raise serializers.ValidationError("El grupo no existe.")  # Si no existe el grupo, mostramos un error

        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar grupos del usuario al token
        token['groups'] = [group.name for group in user.groups.all()]

        # Agregar información adicional al token
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token