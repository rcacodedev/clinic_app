from rest_framework.permissions import BasePermission, SAFE_METHODS

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


class IsAdminOrReadOnlyForWorkers(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            # GET, HEAD, OPTIONS permitidos para admins y workers
            return True
        # POST, PUT, DELETE solo para admins
        return user.groups.filter(name="Admin").exists()