from django.contrib.auth.models import User, Group
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Worker, PDFRegistro
from userinfo.serializers import UserInfoSerializer
from citas.serializers import CitaSerializer

# Serializador de Usuario
class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    userInfo = UserInfoSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'confirm_password', 'userInfo']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user

    def update(self, instance, validated_data):
        userinfo_data = validated_data.pop('userInfo', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if userinfo_data:
            userinfo, created = instance.userinfo.get_or_create(user=instance)
            for attr, value in userinfo_data.items():
                setattr(userinfo, attr, value)
            userinfo.save()

        return instance

# Serializador de Grupos
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]

# Serializador de PDFRegistro
class PDFRegistroSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%dT%H:%M:%S")


    class Meta:
        model = PDFRegistro
        fields = ['id', 'url', 'date']

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

# Serializador de Worker
class WorkerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    appointments = CitaSerializer(many=True, read_only=True)
    groups = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True)
    pdf_registros = PDFRegistroSerializer(many=True, read_only=True)

    class Meta:
        model = Worker
        fields = [
            'id',
            'user',
            'created_by',
            'first_name',
            'last_name',
            'appointments',
            'groups',
            'color',
            'pdf_registros',
        ]
        read_only_fields = ['created_by']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        groups_data = validated_data.pop('groups', [])

        # Crear usuario
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Crear worker con usuario y creador
        validated_data['created_by'] = self.context['request'].user
        worker = Worker.objects.create(user=user, **validated_data)

        # Asignar grupos a Worker (no a User)
        if groups_data:
            worker.groups.set(groups_data)
        return worker

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        groups_data = validated_data.pop('groups', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if groups_data is not None:
            instance.groups.set(groups_data)

        if user_data:
            user = instance.user
            userinfo_data = user_data.pop('userinfo', None)

            password = user_data.pop('password', None)
            for attr, value in user_data.items():
                setattr(user, attr, value)
            if password:
                user.set_password(password)
            user.save()

            if userinfo_data:
                userinfo, created = user.userinfo.get_or_create(user=user)
                for attr, value in userinfo_data.items():
                    setattr(userinfo, attr, value)
                userinfo.save()

        return instance
