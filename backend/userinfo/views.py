from rest_framework import generics
from .models import UserInfo
from .serializers import UserInfoSerializer
from rest_framework.permissions import IsAuthenticated

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