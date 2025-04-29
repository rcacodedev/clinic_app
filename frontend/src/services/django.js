import api from "./api";

const URL_BACKEND= '/groups/'

// Obtiene lista de grupos en Django

export const fetchGrupos = async () => {
    try {
        const response = await api.get(URL_BACKEND);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de grupos:", error)
        throw error;
    }
};