from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("pacientes/", include('patients.urls')),
    path("citas/", include('citas.urls')),
    path('workers/', include('workers.urls')),
    path('actividades/', include('actividades.urls')),
    path('api/', include('api.urls')),
    path('userInfo/', include('userinfo.urls')),
    path('formacion/', include('formacion.urls')),
    path('notas/', include('notes.urls')),
    path('facturas/', include('facturacion.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)