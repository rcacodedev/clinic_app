from django.contrib.auth.models import User, Group
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

def custom_user_payload(user):
    """
    Esta función agrega los grupos del usuario al payload del token.
    """
    return {
        'user_id': user.id,
        'groups': [group.name for group in user.groups.all()]  # Incluir los grupos del usuario
    }

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    # Verificar si los grupos existen y se agregan correctamente al payload
    groups = [group.name for group in user.groups.all()]
    print(f"Grupos del usuario {user.id}: {groups}")  # Debug para verificar los grupos

    # Actualizar el payload con los grupos y el user_id
    refresh.payload['user_id'] = user.id
    refresh.payload['groups'] = groups  # Asegurarnos de que los grupos se añaden correctamente


    # Asegúrate de que los grupos estén realmente añadidos
    print(f"Payload del token: {refresh.payload}")

    return str(refresh.access_token), str(refresh.refresh_token)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        print("Solicitud recibida:", self.request)
        user = serializer.save()  # Guardamos al usuario primero
        group_name = self.request.data.get('group')  # Obtenemos el grupo de la solicitud

        if group_name:
            try:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
            except Group.DoesNotExist:
                raise ValidationError("El grupo no existe.")

        # Crear y devolver el token con los grupos
        access_token, refresh_token = get_tokens_for_user(user)
        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token
        })

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Verificar la contraseña actual
        if not user.check_password(current_password):
            return Response({"error": "La contraseña actual es incorrecta."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que las contraseñas nuevas coincidan
        if new_password != confirm_password:
            return Response({"error": "Las nuevas contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

        # Cambiar la contraseña
        user.set_password(new_password)
        user.save()

        return Response({"success": "La contraseña se ha actualizado correctamente."}, status=status.HTTP_200_OK)

class ListGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = Group.objects.all().values('id', 'name')
        return Response(groups)