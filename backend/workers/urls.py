from django.urls import path
from .views import  WorkerListCreateView, WorkerDetailView, WorkerAppointmentsView, CreateWorkerAppointmentView, AppointmentDetailView, GetPDFs, UploadPDF
from . import views

urlpatterns = [
    path('', WorkerListCreateView.as_view(), name='worker-list-create'),  # Listar trabajadores
    path('<int:pk>/', WorkerDetailView.as_view(), name='worker-detail'),
    path('<int:pk>/appointments/', WorkerAppointmentsView.as_view(), name='worker-appointments'),
    path('<int:pk>/appointments/create/', CreateWorkerAppointmentView.as_view(), name='create-worker-appointment'),
    path('<int:worker_pk>/appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/upload-pdf/', UploadPDF.as_view(), name='upload-pdf'),
    path('<int:pk>/get-pdfs/', GetPDFs.as_view(), name='get-pdfs'),
    path('get-worker-id/<int:user_id>/', views.get_worker_by_user, name='get_worker_by_user'),
]
