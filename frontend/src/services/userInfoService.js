import api from "./api"; // Importa tu instancia de Axios

const URL_BACKEND = 'api/userInfo/'

// Obtiene los datos del usuario actual
export const fetchUserInfo = async () => {
  try {
    const response = await api.get(URL_BACKEND);
    return response.data; // Devuelve los datos obtenidos
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    throw error; // Lanza el error para que sea manejado en el componente
  }
};

// Actualiza los datos del usuario actual
export const updateUserInfo = async (userData) => {
  try {
    const response = await api.patch(`${URL_BACKEND}update/`, userData);
    return response.data; // Devuelve los datos actualizados
  } catch (error) {
    console.error("Error al actualizar la información del usuario:", error);
    throw error; // Lanza el error para que sea manejado en el componente
  }
};
