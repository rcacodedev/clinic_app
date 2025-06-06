from django.contrib.auth.models import User, Group
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

def custom_user_payload(user):
    """
    Esta función agrega los grupos del usuario al payload del token.
    """
    return {
        'user_id': user.id,
        'groups': [group.name for group in user.groups.all()],  # Incluir los grupos del usuario
        'first_name': user.first_name,
        'last_name': user.last_name
    }

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token  # Generar el token de acceso

    # Agregar información personalizada al token de acceso
    access['user_id'] = user.id
    access['groups'] = [group.name for group in user.groups.all()]
    access['first_name'] = user.first_name
    access['last_name'] = user.last_name

    # Debugging para verificar los valores añadidos
    print(f"Token de acceso generado para el usuario {user.username}: {access}")

    return {
        'refresh': str(refresh),
        'access': str(access),
    }

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        group_name = request.data.get('group')
        if group_name:
            try:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
            except Group.DoesNotExist:
                return Response({"error": "El grupo no existe."}, status=status.HTTP_400_BAD_REQUEST)

        tokens = get_tokens_for_user(user)

        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': serializer.data,
            'access_token': tokens['access'],
            'refresh_token': tokens['refresh'],
        }, status=status.HTTP_201_CREATED, headers=headers)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not user.check_password(current_password):
            return Response({"error": "La contraseña actual es incorrecta."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "Las nuevas contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

        # Validar contraseña según reglas de Django
        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"success": "La contraseña se ha actualizado correctamente."}, status=status.HTTP_200_OK)



class ListGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = Group.objects.all().values('id', 'name')
        return Response(groups)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = f"{request.data.get('frontend_base_url')}/reset-password/{uid}/{token}"

            # Renderizar el contenido HTML con contexto
            html_content = render_to_string("emails/password_reset_email.html", {
                "reset_link": reset_link,
                "user": user,
            })

            subject = "Restablece tu contraseña"
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [email]

            msg = EmailMultiAlternatives(subject, "", from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            return Response({"success": "Correo enviado correctamente."}, status=200)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=400)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "Token inválido."}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado."}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"success": "Contraseña actualizada correctamente."}, status=200)
