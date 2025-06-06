from django.urls import path
from .views import (
    WorkerListCreateView, WorkerDetailView,
    WorkerAppointmentsView, CreateWorkerAppointmentView, AppointmentDetailView,
    UploadPDF, GetPDFs, DeletePDF,
    WorkerIdFromUserId,
    get_worker_by_user,
)

urlpatterns = [
    # Trabajadores
    path('', WorkerListCreateView.as_view(), name='worker-list-create'),
    path('<int:pk>/', WorkerDetailView.as_view(), name='worker-detail'),

    # Citas asociadas a un trabajador
    path('<int:worker_pk>/appointments/', WorkerAppointmentsView.as_view(), name='worker-appointments-list'),
    path('<int:worker_pk>/appointments/create/', CreateWorkerAppointmentView.as_view(), name='worker-appointments-create'),
    path('<int:worker_pk>/appointments/<int:pk>/', AppointmentDetailView.as_view(), name='worker-appointment-detail'),

    # PDFs asociados a un trabajador
    path('<int:worker_pk>/pdfs/upload/', UploadPDF.as_view(), name='worker-pdf-upload'),
    path('<int:worker_pk>/pdfs/', GetPDFs.as_view(), name='worker-pdf-list'),
    path('pdfs/<int:pdf_id>/delete/', DeletePDF.as_view(), name='worker-pdf-delete'),

    # Otras vistas auxiliares
    path('user/<int:user_id>/', get_worker_by_user, name='worker-by-user'),
    path('id-from-user/<int:user_id>/', WorkerIdFromUserId.as_view(), name='worker-id-from-user-id'),
]
