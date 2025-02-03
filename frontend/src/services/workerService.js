import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const API_URL= '/api/workers/';

// Obtener la lista de trabajadores
export const fetchWorkers = async () => {
  try {
    const response = await api.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Obtener la lista de trabajadores')
  }
};

// Crear un nuevo trabajador
export const createWorker = async (workerData) => {
  try {
    const response = await api.post(`${API_URL}`, workerData, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Crear un trabajador');
  }
};

// Obtener detalles de un trabajador
export const fetchWorkerDetails = async (workerId) => {
  try {
    const response = await api.get(`${API_URL}${workerId}/`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Obtener detalles del trabajador')
  }
};

// Editar un trabajador
export const updateWorker = async (workerId, updatedData) => {
  try {
    const response = await api.patch(`${API_URL}${workerId}/`, updatedData, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Editar un trabajador');
  }
};

// Eliminar un trabajador
export const deleteWorker = async (workerId) => {
  try {
    const response = await api.delete(`${API_URL}${workerId}/`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Eliminar un trabajador');
  }
};

// Obtener citas de un trabajador
export const fetchWorkerAppointments = async (workerId) => {
  try {
    const response = await api.get(`${API_URL}${workerId}/appointments/`, getAuthHeaders());
    return response.data.results || [];
  } catch (error) {
    handleApiError(error, 'Obtener citas del trabajador');
  }
};

// Asignar una nueva cita a un trabajador
export const assignAppointmentToWorker = async (workerId, appointmentData) => {
  try {
    const response = await api.post(`${API_URL}${workerId}/appointments/create/`, appointmentData, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Asignar una cita al trabajador');
  }
};

// Editar una cita de un trabajador
export const updateWorkerAppointment = async (workerId, appointmentId, updatedData) => {
  try {
    // La URL debe incluir tanto workerId como appointmentId
    const response = await api.patch(`${API_URL}${workerId}/appointments/${appointmentId}/`, updatedData, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Editar una cita del trabajador');
  }
};

// Eliminar una cita de un trabajador
export const deleteWorkerAppointment = async (workerId, appointmentId) => {
  try {
    // La URL debe incluir tanto workerId como appointmentId
    const response = await api.delete(`${API_URL}${workerId}/appointments/${appointmentId}/`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error, 'Eliminar una cita del trabajador');
  }
};

