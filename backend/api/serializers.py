from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import Group

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'},
        validators=[validate_password]
    )
    group = serializers.CharField(write_only=True, required=False)  # Para recibir grupo al crear
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    # Para mostrar grupos del usuario (lectura)
    groups = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'group', 'groups')

    def create(self, validated_data):
        group_name = validated_data.pop('group', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # La asignación del grupo la puedes manejar aquí o en la vista
        if group_name:
            user.groups.clear()  # Opcional: eliminar grupos anteriores si es necesario
            group = Group.objects.filter(name=group_name).first()
            if group:
                user.groups.add(group)
        return user

    def get_groups(self, obj):
        return [group.name for group in obj.groups.all()]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id
        token['groups'] = [group.name for group in user.groups.all()]
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token
