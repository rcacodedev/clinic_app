from django.urls import path
from .views import UserInfoDetailView, UserInfoUpdateView

urlpatterns = [
    path("", UserInfoDetailView.as_view(), name='user_info_detail'),
    path('update/', UserInfoUpdateView.as_view(), name='user_info_update'),
]
