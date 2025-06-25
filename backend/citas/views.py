from datetime import datetime, timedelta
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cita, ConfiguracionPrecioCita
from workers.models import Worker
from .serializers import CitaSerializer, ConfiguracionPrecioCitaSerializer
from userinfo.models import UserInfo
from twilio.rest import Client
from django.utils.dateformat import format as dj_format
from rest_framework import status
import locale


def get_precio_global():
    config = ConfiguracionPrecioCita.objects.first()
    return config.precio_global if config else 25


def get_fecha_range(filter_type):
    today = datetime.today()

    if filter_type == 'hoy':
        start = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end = today.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_type == 'mañana':
        tomorrow = today + timedelta(days=1)
        start = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        end = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_type == 'semana':
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    elif filter_type == 'mes':
        start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if today.month == 12:
            end = start.replace(year=today.year + 1, month=1)
        else:
            end = start.replace(month=today.month + 1)
        end -= timedelta(seconds=1)
    else:
        start = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end = today.replace(hour=23, minute=59, second=59, microsecond=999999)

    return start, end


class CitasListCreateAPIView(ListCreateAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        filter_type = self.request.query_params.get('filter_type')

        queryset = Cita.objects.select_related('paciente', 'worker', 'user')

        if user.groups.filter(name='worker').exists():
            queryset = queryset.filter(worker__user=user)
        else:
            queryset = queryset.filter(Q(user=user) | Q(worker__user=user))

        if filter_type and filter_type != 'todos':
            start_date, end_date = get_fecha_range(filter_type)
            queryset = queryset.filter(fecha__range=(start_date, end_date))

        return queryset.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        precio_global = get_precio_global()

        worker = Worker.objects.filter(user=user).first()

        if 'precio' not in serializer.validated_data:
            serializer.save(user=user, worker=worker, precio=precio_global)
        else:
            serializer.save(user=user, worker=worker)


class CitasDetailAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Cita.objects.select_related('paciente', 'worker', 'user')

        if user.groups.filter(name='worker').exists():
            return queryset.filter(worker__user=user)
        return queryset.filter(Q(user=user) | Q(worker__user=user))


def enviar_mensaje_whatsapp(client, from_number, to_number, mensaje):
    try:
        message = client.messages.create(
            from_=f"whatsapp:{from_number}",
            to=f"whatsapp:{to_number}",
            body=mensaje
        )
        return {"telefono": to_number, "status": message.status}
    except Exception as e:
        return {"telefono": to_number, "error": str(e)}

class CitasPorPacienteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, paciente_id):
        """
        Devuelve todas las citas asociadas a un paciente específico
        """
        citas = Cita.objects.filter(paciente_id=paciente_id).order_by('-fecha', '-comenzar')
        serializer = CitaSerializer(citas, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnviarRecordatorioWhatsAppAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_info = UserInfo.objects.filter(user=user).first()

        if not user_info or not all([
            user_info.twilio_account_sid,
            user_info.twilio_auth_token,
            user_info.whatsapp_business_number,
        ]):
            return Response({"error": "Faltan credenciales de Twilio"}, status=400)

        citas_ids = request.data.get("citas_ids", [])
        print(f"Citas IDs recibidos: {citas_ids}")
        if not isinstance(citas_ids, list):
            return Response({"error": "Se requiere una lista de IDs de citas"}, status=400)

        if not citas_ids:
            return Response({"error": "Se requiere al menos un ID de cita"}, status=400)

        citas = Cita.objects.select_related("paciente").filter(id__in=citas_ids, user=user)
        print(f"Citas encontradas: {citas}")
        if not citas.exists():
            return Response({"message": "No hay citas encontradas con esos IDs"}, status=404)

        client = Client(user_info.twilio_account_sid, user_info.twilio_auth_token)
        resultados = []

        try:
            locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
        except locale.Error:
            locale.setlocale(locale.LC_TIME, 'es_ES')

        for cita in citas:
            paciente = cita.paciente
            print(f"Cita {cita.id} tiene worker: {cita.worker}")
            if not paciente.phone:
                continue

            fecha = cita.fecha
            comenzar = cita.comenzar

            dia = fecha.day
            mes = fecha.strftime('%B').lower()  # mes en minúsculas
            hora = comenzar.strftime('%H:%M') + " h"

            texto = (
                        f"Buenos días! Te recuerdo que mañana {dia} de {mes} tienes cita de {paciente.grupo} "
                        f"con nosotras en la clínica Actúa a las {hora}. Agradecemos que confirméis vuestra "
                        f"cita lo antes posible para así, en caso de ser necesario, poder hacer las modificaciones necesarias. "
                        "Un abrazo, equipo Actúa."
                    )
            resultado = enviar_mensaje_whatsapp(client, user_info.whatsapp_business_number, paciente.phone, texto)
            resultado["paciente"] = paciente.nombre
            resultados.append(resultado)

        return Response({"mensajes_enviados": resultados}, status=200)


class ConfiguracionPrecioGlobal(RetrieveUpdateDestroyAPIView):
    queryset = ConfiguracionPrecioCita.objects.all()
    serializer_class = ConfiguracionPrecioCitaSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return ConfiguracionPrecioCita.objects.first()
