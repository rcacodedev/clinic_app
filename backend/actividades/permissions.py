from rest_framework import permissions

class IsAdminGroup(permissions.BasePermission):
    """
    Permiso personalizado: solo los usuarios autenticados en el grupo 'Admin' pueden crear, editar o eliminar.
    Lectura permitida para cualquier usuario autenticado.
    """

    def has_permission(self, request, view):
        # Permitir lectura (GET, HEAD, OPTIONS) a usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Para POST, PUT, PATCH, DELETE: debe ser admin
        return (
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name='Admin').exists()
        )
