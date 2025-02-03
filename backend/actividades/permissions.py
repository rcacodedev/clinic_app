from rest_framework import permissions

class IsAdminGroup(permissions.BasePermission):
    """
    Permiso para que solo los usuarios en el grupo 'Admin' puedan crear, editar o eliminar.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            # Permitir lectura para cualquier usuario autenticado
            return request.user and request.user.is_authenticated
        # Para crear, editar y eliminar, el usuario debe estar en el grupo 'Admin'
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Admin').exists()
