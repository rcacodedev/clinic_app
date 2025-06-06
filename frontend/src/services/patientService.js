import api from "./api";
import { handleApiError } from "../utils/error_log";
import { getAuthHeaders } from "../utils/auth";

const API_URL = "/pacientes/";

export const getPacientes = async ({
  page = 1,
  searchTerm = "",
  includePagination = true,
} = {}) => {
  try {
    const url = includePagination
      ? `${API_URL}?page=${page}&search=${searchTerm}`
      : `${API_URL}?search=${searchTerm}`;
    const response = await api.get(url);
    return response.data; // Retorna los datos de los pacientes
  } catch (error) {
    handleApiError(error, "Obtener la lista de pacientes");
  }
};

export const getPacientesById = async (id) => {
  try {
    const response = await api.get(`${API_URL}${id}/`);
    return response.data; // Retorna los datos del paciente
  } catch (error) {
    handleApiError(error, "Obtener los detalles del paciente");
  }
};

export const crearPaciente = async (data) => {
  try {
    const response = await api.post(API_URL, data);
    return response.data; // Retorna el paciente creado
  } catch (error) {
    handleApiError(error, "Crear un paciente");
  }
};

export const updatePaciente = async (id, updatedData) => {
  try {
    const response = await api.patch(`${API_URL}${id}/`, updatedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Retorna el paciente actualizado
  } catch (error) {
    handleApiError(error, "Actualizar un paciente");
  }
};

export const deletePaciente = async (id) => {
  try {
    const response = await api.delete(`${API_URL}${id}/`);
    return { status: response.status, message: "Paciente eliminado con éxito" }; // Retorna el estado para confirmación
  } catch (error) {
    handleApiError(error, "Eliminar un paciente");
  }
};

// Subir los PDFs firmados para un paciente
export const uploadSignedPDFs = async (id, formData) => {
  try {
    const response = await api.post(
      `${API_URL}${id}/upload-signed-pdf/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Necesario para enviar archivos
        },
      }
    );

    // Retornar la respuesta con las URLs de los PDFs guardados
    return response.data;
  } catch (error) {
    handleApiError(error, "Subir los PDFs firmados");
  }
};

// Obtener documentos del paciente
export const fetchDocumentos = async (patientId) => {
  try {
    const response = await api.get(
      `${API_URL}documentos/?patient_id=${patientId}`,
      getAuthHeaders()
    );
    return response.data.results || response.data;
  } catch (error) {
    handleApiError(error, "Error al obtener documentos del paciente");
    return [];
  }
};

// Subir documentos al paciente
export const uploadDocumentos = async (patientId, file) => {
  const formData = new FormData();
  formData.append("archivo", file);

  const url = `${API_URL}documentos/?patient_id=${patientId}`;

  try {
    const response = await api.post(url, formData, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(
      error,
      "Error al subir los documentos clínicos del paciente"
    );
  }
};

// Eliminar un documento
export const deleteDocumento = async (documentId) => {
  try {
    await api.delete(
      `${API_URL}documentos/${documentId}/eliminar/`,
      getAuthHeaders()
    );
    return { success: true };
  } catch (error) {
    handleApiError(error, "Error al eliminar el documento.");
  }
};
