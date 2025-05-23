import api from "./api";
import { handleApiError } from "../utils/error_log";
import { getAuthHeaders } from "../utils/auth";

const API_URL = '/pacientes/';

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

// Subir los PDFs firmados para un paciente
const uploadSignedPDFs = async (id, formData) => {
  try {
    const response = await api.post(`${API_URL}${id}/upload-signed-pdf/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Necesario para enviar archivos
      },
    });

    // Retornar la respuesta con las URLs de los PDFs guardados
    return response.data;
  } catch (error) {
    handleApiError(error, 'Subir los PDFs firmados');
  }
};

// Obtener documentos del paciente
export const fetchDocuments = async (patientId) => {
  try {
    const response = await api.get(`${API_URL}documents/?patient_id=${patientId}`, getAuthHeaders())
    return response.data.results || response.data;
  } catch (error) {
    handleApiError(error, 'Error al obtener documentos del paciente')
    return [];
  }
};

// Subir documentos al paciente
export const uploadDocuments = async (patientId, file) => {
  const formData = new FormData();
  formData.append('patient', patientId);
  formData.append('file', file);

  try {
    const response = await api.post(`${API_URL}documents/`, formData, getAuthHeaders())
    return response.data
  } catch (error) {
    handleApiError(error, 'Error al subir archivos al paciente')
  }
};

// Eliminar un documento
export const deleteDocument = async (documentId) => {
  try {
    await api.delete(`${API_URL}delete-document/${documentId}/`, getAuthHeaders())
    return {success: true}
  } catch (error) {
    handleApiError(error, 'Error al eliminar el documento.')
  }
}

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  uploadSignedPDFs,
};
