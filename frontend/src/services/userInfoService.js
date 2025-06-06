import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const URL_BACKEND = "/userInfo/";

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
    const { photo, ...dataToSend } = userData;
    const response = await api.patch(`${URL_BACKEND}update/`, dataToSend);
    return response.data; // Devuelve los datos actualizados
  } catch (error) {
    console.error(
      "Error al actualizar la información del usuario:",
      error.response ? error.response.data : error.message
    );
    throw error; // Lanza el error para que sea manejado en el componente
  }
};

export const updatePhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  try {
    const response = await api.patch(`${URL_BACKEND}update-photo/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders().headers,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al actualizar foto");
  }
};
