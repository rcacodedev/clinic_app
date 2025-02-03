import api from './api';
import { handleApiError } from '../utils/error_log';
import { getAuthHeaders } from '../utils/auth';  // Si necesitas encabezados de autenticación

const BASE_URL = '/api/actividades/';  // La URL base para las actividades

// Obtener todas las actividades
export const getActivities = async () => {
    try {
        const response = await api.get(BASE_URL, getAuthHeaders());  // Si se necesita autenticación
        return response.data;
    } catch (error) {
        handleApiError(error, 'Obtener todas las actividades');
    }
};

// Obtener una actividad por su id
export const getActivity = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}${id}/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, `Obtener la actividad con id ${id}`);
    }
};

// Crear una nueva actividad
export const createActivity = async (activityData) => {
    try {
        const response = await api.post(BASE_URL, activityData, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, 'Crear una nueva actividad');
    }
};

// Editar una actividad existente
export const updateActivity = async (id, activityData) => {
    try {
        const response = await api.patch(`${BASE_URL}${id}/`, activityData, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, `Actualizar la actividad con id ${id}`);
    }
};

// Eliminar una actividad
export const deleteActivity = async (id) => {
    try {
        const response = await api.delete(`${BASE_URL}${id}/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        handleApiError(error, `Eliminar la actividad con id ${id}`);
    }
};
