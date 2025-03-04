from rest_framework import serializers
from .models import Formacion

class FormacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formacion
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}