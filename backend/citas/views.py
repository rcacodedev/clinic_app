import requests
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Citas
from workers.models import Worker
from .serializers import CitasSerializer
from userinfo.models import UserInfo
from twilio.rest import Client

class CitasListCreateAPIView(ListCreateAPIView):
    """Vista para listar y crear citas"""
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Filtrar citas según el tipo de usuario y fecha."""
        user = self.request.user
        queryset = Citas.objects.select_related('patient', 'worker', 'user')

        # Filtrar según el tipo de usuario
        if user.groups.filter(name='worker').exists():
            queryset = queryset.filter(worker__user=user)  # Buscar solo las citas asignadas al worker
        else:
            queryset = queryset.filter(Q(user=user) | Q(worker__user=user))  # Admin ve sus citas y las de los trabajadores

        # Obtener el tipo de filtro desde los parámetros de la URL
        filter_type = self.request.query_params.get('filter_type')
        today = datetime.today()

        if filter_type != 'todos':
            today = datetime.today()
            if filter_type == 'hoy':
                start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
            elif filter_type == 'mañana':
                tomorrow = today + timedelta(days=1)
                start_date = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)
            elif filter_type == 'semana':
                start_date = today - timedelta(days=today.weekday())  # Lunes de la semana actual
                end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
            elif filter_type == 'mes':
                start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                end_date = today.replace(month=today.month + 1 if today.month < 12 else 1, day=1, hour=0, minute=0) - timedelta(seconds=1)
            else:
                start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)

            # Filtrar por fecha
            queryset = queryset.filter(fecha__range=[start_date, end_date])

        return queryset.distinct().filter(Q(worker__user=user) | Q(user=user))

    def perform_create(self, serializer):
        """Guardar citas asociadas al usuario actual."""
        user = self.request.user

        # Asegurarse de que el worker es el mismo que el usuario
        if user.is_authenticated:
            # Obtener el objeto Worker relacionado con el usuario
            try:
                worker = Worker.objects.get(user=user)
            except Worker.DoesNotExist:
                worker = None  # Si el usuario no es un trabajador, no asignar un worker

            # Si el worker es un trabajador, asignar ese worker a la cita
            serializer.save(user=user, worker=worker)

class CitasDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar o eliminar una cita."""
    serializer_class = CitasSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar citas según el tipo de usuario"""
        user = self.request.user
        queryset = Citas.objects.select_related('patient', 'worker', 'user')

        if user.is_staff:
            return queryset.filter(worker__user=user)
        return queryset.filter(user=user)

class EnviarRecordatorioWhatsAppAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_info = UserInfo.objects.filter(user=user).first()

        if not user_info or not user_info.twilio_account_sid or not user_info.twilio_auth_token or not user_info.twilio_whatsapp_number:
            return Response({"error": "Faltan credenciales de Twilio"}, status=400)

        citas_ids = request.data.get("citas_ids")
        if not citas_ids or not isinstance(citas_ids, list):
            return Response({"error": "Se requiere una lista de IDs de citas"}, status=400)

        citas = Citas.objects.filter(id__in=citas_ids, worker__user=user)
        if not citas.exists():
            return Response({"message": "No hay citas encontradas con esos IDs"}, status=404)

        client = Client(user_info.twilio_account_sid, user_info.twilio_auth_token)
        mensajes_enviados = []

        for cita in citas:
            paciente = cita.patient
            if not paciente.phone:
                continue

            mensaje_texto = (
                f"Hola {paciente.name}, te recordamos tu cita el {cita.fecha.strftime('%d-%m-%Y')} "
                f"a las {cita.comenzar.strftime('%H:%M')}."
            )

            try:
                message = client.messages.create(
                    from_=f"whatsapp:{user_info.twilio_whatsapp_number}",
                    to=f"whatsapp:{paciente.phone}",
                    body=mensaje_texto
                )

                mensajes_enviados.append({
                    "paciente": paciente.name,
                    "telefono": paciente.phone,
                    "status": message.status
                })
            except Exception as e:
                mensajes_enviados.append({
                    "paciente": paciente.name,
                    "telefono": paciente.phone,
                    "error": str(e)
                })

        return Response({"mensajes_enviados": mensajes_enviados}, status=200)
