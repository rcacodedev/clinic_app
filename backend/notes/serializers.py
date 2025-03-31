from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    reminder_date = serializers.DateField(format="%Y-%m-%d", allow_null=True, required=False)

    class Meta:
        model = Note
        fields = '__all__'