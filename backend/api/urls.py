from django.urls import path
from .views import ChangePasswordView, CreateUserView, ListGroupsView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("create-user/", CreateUserView.as_view(), name="create_user"),
    path("groups/", ListGroupsView.as_view(), name="list_groups"),
    path("token/", CustomTokenObtainPairView.as_view(), name="custom_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh_token"),
]