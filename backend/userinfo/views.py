from rest_framework import generics
from .models import UserInfo
from .serializers import UserInfoSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

class UserInfoDetailView(generics.RetrieveAPIView):
    queryset = UserInfo.objects.all()
    serializer_class = UserInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.userInfo

class UserInfoUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.userInfo

    def patch(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs, partial=True)

class UserInfoUpdatePhotoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, *args, **kwargs):
        user_info = request.user.userInfo

        # Obtener la foto desde los datos del formulario
        photo = request.FILES.get('photo')

        if photo:
            user_info.photo = photo
            user_info.save()
            return Response({
                'message': 'Foto actualizada',
                'photo': user_info.photo.url
            }, status=status.HTTP_200_OK)

        return Response({
            'message': 'No se ha proporcionado una foto'
        }, status=status.HTTP_400_BAD_REQUEST)