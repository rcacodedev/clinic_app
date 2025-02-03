import api from './api'
import { getAuthHeaders } from '../utils/auth';
import { handleApiError } from '../utils/error_log';

const API_URL = '/api/citas/';  // Ajusta la URL de tu API

// Función para obtener la lista de citas
const getCitas = async (page = 1, searchTerm = '') => {
  try {
    const response = await api.get(`${API_URL}?page=${page}&search=${searchTerm}`, getAuthHeaders());
    const citasOrdenadas = response.data.results.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.finalizar}`);
      const fechaB = new Date(`${b.fecha}T${b.finalizar}`);
      return fechaB - fechaA; // Ordenar de la más reciente a la más antigua
    });
    return citasOrdenadas || [];
  } catch (error) {
    handleApiError(error, 'Obtener las citas');
  }
};
// Función para obtener una cita específica por su ID
const getCitaDetail = async (id) => {
  try {
    const response = await api.get(`${API_URL}${id}/`, getAuthHeaders());
    return response.data;  // Retorna los datos de la cita
  } catch (error) {
    handleApiError(error, 'Detalles de una cita')
  }
};

// Función para crear una nueva cita
const createCita = async (citaData) => {
  try {
    const response = await api.post(API_URL, citaData, getAuthHeaders());
    return response.data;  // Retorna la cita creada
  } catch (error) {
    handleApiError(error, 'Crear una cita')
  }
};

// Función para actualizar una cita
const updateCita = async (id, citaData) => {
  try {
    const response = await api.patch(`${API_URL}${id}/`, citaData, getAuthHeaders());
    return response.data;  // Retorna la cita actualizada
  } catch (error) {
    handleApiError(error, 'Actualizar una cita')
  }
};

// Función para eliminar una cita
const deleteCita = async (id) => {
  try {
    const response = await api.delete(`${API_URL}${id}/`, getAuthHeaders());
    return { status: response.status, message: 'Cita eliminada con éxito' };  // Retorna la respuesta de eliminación
  } catch (error) {
    handleApiError(error, 'Eliminar una cita')
  }
};

export default {
  getCitas,
  getCitaDetail,
  createCita,
  updateCita,
  deleteCita,
}

