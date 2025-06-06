from django.urls import path
from .views import ActivityListCreateView, ActivityRetrieveUpdateDestroyView

app_name = 'actividades'

urlpatterns = [
    path('', ActivityListCreateView.as_view(), name='list_create_activities'),
    path('<int:pk>/', ActivityRetrieveUpdateDestroyView.as_view(), name='retrieve_update_destroy_activity'),
]
