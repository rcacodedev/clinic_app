import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const API_URL = '/formacion/';

// Función para obtener Formaciones
export const getFormacion = async () => {
    try {
        const response = await api.get(API_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Obtener Formaciones')
    }
}

// Funcion para crear Formacion
export const createFormacion = async (formacionData) => {
    try {
        const response = await api.post(API_URL, formacionData, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Crear una Formación')
    }
}

// Funcion para obtener una formacion especifica
export const getDetailFormacion = async (id) => {
    try {
        const response = await api.get(`${API_URL}${id}/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Detalle de Formación')
    }
}

// Funcion para editar una Formacion
export const updateFormacion = async (id, formacionData) => {
    try {
        const response = await api.patch(`${API_URL}${id}/`, formacionData, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Actualizar una Formación');
    }
}

// Funcion para eliminar una Formacion
export const deleteFormacion = async (id) => {
    try {
        const response = await api.delete(`${API_URL}${id}/`, getAuthHeaders());
        return {status: response.status, message: 'Formación eliminada con éxito'};
    } catch (error) {
        handleApiError(error, 'Eliminar una Formación')
    }
}
