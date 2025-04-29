import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const URL_BACKEND = '/notas/'

// Obtener todas las notas
export const fetchNotes = async (page = 1) =>{
    try{
        const response = await api.get(`${URL_BACKEND}?page=${page}`, getAuthHeaders())
        return response.data
    } catch (error){
        handleApiError(error, 'Error al obtener las notas')
    }
};

// Obtener una nota por ID
export const fetchNoteById = async (id) => {
    try {
        const response = await api.get(`${URL_BACKEND}${id}/`, getAuthHeaders())
        return response.data
    } catch (error) {
        handleApiError(error, 'Error al obtener la nota específica')
    }
};

// Crear una nota nueva
export const createNote = async (noteData) => {
    try {
        const response = await api.post(`${URL_BACKEND}`, noteData, getAuthHeaders())
        return response.data
    } catch (error) {
        handleApiError(error, 'Error al crear la nota.')
    }
};

// Actualizar una nota
export const updateNote = async (id, noteData) => {
    try {
        const response = await api.patch(`${URL_BACKEND}${id}/`, noteData, getAuthHeaders())
        return response.data
    } catch (error){
        handleApiError(error, 'Error al actualizar la nota')
    }
};

// Eliminar una nota
export const deleteNote = async (id) => {
    try {
        await api.delete(`${URL_BACKEND}${id}/`, getAuthHeaders())
    } catch (error){
        handleApiError(error, 'Error al eliminar la nota')
    }
};

// Obtener notas por fecha
export const fetchNotesByDate = async (date) => {
    try {
        const response = await api.get(`${URL_BACKEND}date/${date}/`, getAuthHeaders())
        return response.data
    } catch (error){
        handleApiError(error, 'Error al obtener notas por la fecha')
    }
};

// Obtener notas del día actual
export const fetchTodayNotes = async () => {
    try {
        const response = await api.get(`${URL_BACKEND}today/`, getAuthHeaders())
        return response.data;
    } catch(error){
        handleApiError(error, 'Error al obtener las notas de hoy')
    }
}
