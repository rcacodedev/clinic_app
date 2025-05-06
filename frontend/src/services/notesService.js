import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const URL_BACKEND = '/notas/'

// Función genérica para hacer solicitudes GET
const fetchData = async (url) => {
    try {
        const response = await api.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, `Error al obtener los datos de ${url}`);
        return null;  // Devuelves null en caso de error para manejarlo de forma consistente en el componente
    }
}

// Obtener todas las notas
export const fetchNotes = async (page = 1, order = '-is_important,-reminder_date,-created_at') => {
    try {
        const response = await api.get(`${URL_BACKEND}?page=${page}&order=${encodeURIComponent(order)}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Error al obtener las notas');
    }
};


// Obtener una nota por ID
export const fetchNoteById = async (id) => {
    const url = `${URL_BACKEND}${id}/`;
    return fetchData(url);
};

// Crear una nota nueva
export const createNote = async (noteData) => {
    try {
        const response = await api.post(`${URL_BACKEND}`, noteData, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Error al crear la nota.');
        return null;
    }
};

// Actualizar una nota
export const updateNote = async (id, noteData) => {
    try {
        const response = await api.patch(`${URL_BACKEND}${id}/`, noteData, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Error al actualizar la nota');
        return null;
    }
};

// Eliminar una nota
export const deleteNote = async (id) => {
    try {
        await api.delete(`${URL_BACKEND}${id}/`, getAuthHeaders());
        return true;  // Devuelves un valor de éxito
    } catch (error) {
        handleApiError(error, 'Error al eliminar la nota');
        return false;  // Devuelves false si ocurre un error
    }
};

// Obtener notas por fecha
export const fetchNotesByDate = async (date) => {
    const url = `${URL_BACKEND}date/${date}/`;
    return fetchData(url);
};

// Obtener notas del día actual
export const fetchTodayNotes = async () => {
    const url = `${URL_BACKEND}today/`;
    return fetchData(url);
};
