import { ACCESS_TOKEN } from "../constants";

// Función obtener token

export const getToken = () => {
    return localStorage.getItem('access');
};

export const decodeJWT = (token) => {
    if (!token) {
        console.error('Token no proporcionado.');
        return null;
    }

    try {
        const base64Url = token.split('.')[1]; // La parte del payload
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Normalizar Base64
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
};


// Función para decodificar el token
export const getUserIdFromToken = (token) => {
    const decoded = decodeJWT(token);

    if (decoded) {
        return decoded.user_id; // Asegúrate de que tu token contiene 'user_id'
    }

    console.error('No se pudo obtener user_id del token.');
    return null;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem(ACCESS_TOKEN); // Cambia esto si guardas el token en otro lugar
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
  };

export const isAdmin = () => {
    const token = getToken();
    if (!token) return false;

    const decoded = decodeJWT(token);
    return decoded.groups && decoded.groups.includes('Admin');
}