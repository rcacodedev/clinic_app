import api from "./api";
import { handleApiError } from "../utils/error_log";

const API_URL = '/api/pacientes/';

const getPatients = async ({ page = 1, searchTerm = '', includePagination = true } = {}) => {
  try {
    const url = includePagination
      ? `${API_URL}?page=${page}&search=${searchTerm}`
      : `${API_URL}?search=${searchTerm}`;
    const response = await api.get(url);
    return response.data; // Retorna los datos de los pacientes
  } catch (error) {
    handleApiError(error, 'Obtener la lista de pacientes');
  }
};

const getPatientById = async (id) => {
  try {
    const response = await api.get(`${API_URL}${id}/`);
    return response.data; // Retorna los datos del paciente
  } catch (error) {
    handleApiError(error, 'Obtener los detalles del paciente');
  }
};

const createPatient = async (data) => {
  try {
    const response = await api.post(API_URL, data);
    return response.data; // Retorna el paciente creado
  } catch (error) {
    handleApiError(error, 'Crear un paciente');
  }
};

const updatePatient = async (id, updatedData) => {
  try {
    const response = await api.put(`${API_URL}${id}/`, updatedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Retorna el paciente actualizado
  } catch (error) {
    handleApiError(error, 'Actualizar un paciente');
  }
};

const deletePatient = async (id) => {
  try {
    const response = await api.delete(`${API_URL}${id}/`);
    return { status: response.status, message: 'Paciente eliminado con éxito' }; // Retorna el estado para confirmación
  } catch (error) {
    handleApiError(error, 'Eliminar un paciente');
  }
};

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
