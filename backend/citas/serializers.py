from rest_framework import serializers
from .models import Citas
from patients.models import Patient

class CitasSerializer(serializers.ModelSerializer):
    # Campos adicionales para nombres completos de los pacientes
    patient_name = serializers.StringRelatedField(source='patient.nombre', read_only=True)
    patient_primer_apellido = serializers.StringRelatedField(source='patient.primer_apellido', read_only=True)
    patient_segundo_apellido = serializers.StringRelatedField(source='patient.segundo_apellido', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    # Campo para la creación de citas basado en el nombre completo del paciente
    patient_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Citas
        fields = ['id', 'patient', 'patient_name', 'patient_primer_apellido', 'cotizada', 'patient_segundo_apellido', 'fecha', 'comenzar', 'finalizar', 'descripcion', 'user_id', 'worker', 'patient_name_input']
        extra_kwargs = {
            'patient': {'required': False}
        }

    def validate_patient_name_input(self, value):
        """Validar y procesar el nombre completo del paciente."""
        name_parts = value.split()
        if len(name_parts) < 2:
            raise serializers.ValidationError("Se requiere un nombre y apellido completos.")
        return value

    def create(self, validated_data):
        """Crear una cita asociando el paciente por nombre completo."""
        patient_name_input = validated_data.pop('patient_name_input', None)
        print('Datos validados recibidos:', validated_data)
        if patient_name_input:
            print('Nombre del paciente input:', patient_name_input)
            name_parts = patient_name_input.split()
            first_name = name_parts[0]
            last_name = name_parts[1]
            second_last_name = name_parts[2] if len(name_parts) > 2 else ''

            try:
                if second_last_name:
                    patient = Patient.objects.get(
                        nombre__iexact=first_name,
                        primer_apellido__iexact=last_name,
                        segundo_apellido__iexact=second_last_name
                    )
                else:
                    patient = Patient.objects.get(
                        nombre__iexact=first_name,
                        primer_apellido__iexact=last_name
                    )
                print('Paciente encontrado:', patient)
            except Patient.DoesNotExist:
                raise serializers.ValidationError("Paciente no encontrado")
            validated_data['patient'] = patient
        else:
            raise serializers.ValidationError("El campo 'patient_name_input' es obligatorio.")


        # Asignar el usuario autenticado al campo 'user' automáticamente
        validated_data['user'] = self.context['request'].user
        print('Datos finales validados:', validated_data)

        # Si no se proporciona un trabajador, el campo 'worker' puede ser nulo.
        worker = validated_data.get('worker', None)
        if not worker:
            validated_data['worker'] = None

        return super().create(validated_data)