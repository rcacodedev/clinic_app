from django.contrib import admin
from django.views.generic import TemplateView
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    # path("api/token/", TokenObtainPairView.as_view(), name="get_token"), # Genera un token JWT
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"), # Renueva el token JWT
    path("api-auth/", include("rest_framework.urls")),
    path("api/pacientes/", include('patients.urls')),
    path("api/citas/", include('citas.urls')),
    path('api/workers/', include('workers.urls')),
    path('api/actividades/', include('actividades.urls')),
    path('api/', include('api.urls')),
    path('api/userInfo/', include('userinfo.urls')),
    path('api/finanzas/', include('finanzas.urls')),
    # Ruta para servir el archivo index.html
    path('', TemplateView.as_view(template_name='index.html')),  # Para la raíz

    # Redirigir todas las demás rutas a index.html (para React Router)
    re_path(r'^(?!api/).*', TemplateView.as_view(template_name='index.html')),  # Para todas las rutas no API
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)