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

// Subir los PDFs firmados para un paciente
const uploadSignedPDFs = async (id, pdfFiles) => {
  try {
    const formData = new FormData();

    // Añadir cada archivo PDF al formData
    if (pdfFiles.pdf_firmado_general) {
      formData.append("pdf_firmado_general", pdfFiles.pdf_firmado_general);
    }
    if (pdfFiles.pdf_firmado_menor) {
      formData.append("pdf_firmado_menor", pdfFiles.pdf_firmado_menor);
    }
    if (pdfFiles.pdf_firmado_inyecciones) {
      formData.append("pdf_firmado_inyecciones", pdfFiles.pdf_firmado_inyecciones);
    }

    const response = await api.post(`${API_URL}${id}/upload-signed-pdf/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Necesario para enviar archivos
      },
    });

    // Retornar la respuesta con las URLs de los PDFs guardados
    return response.data;
  } catch (error) {
    handleApiError(error, 'Subir los PDFs firmados');
  }
};

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  uploadSignedPDFs,
};
