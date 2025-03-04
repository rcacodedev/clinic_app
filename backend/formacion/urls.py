from django.urls import path
from .views import FormacionListCreateView, FormacionDetailView

urlpatterns = [
    path('', FormacionListCreateView.as_view(), name='fomacion-list-create'),
    path('<int:pk>/', FormacionDetailView.as_view(), name='formacion-detail'),
]
