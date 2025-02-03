from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Permiso para verificar si el usuario pertenece al grupo 'Admin'.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Admin").exists()

class IsWorker(BasePermission):
    """
    Permiso para verificar si el usuario pertenece al grupo 'Workers'.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Workers").exists()
