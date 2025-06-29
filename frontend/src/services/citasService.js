import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const API_URL = "/citas/"; // Ajusta la URL de tu API

// Función para obtener la lista de citas con filtros por fecha
export const getCitas = async (
  page = 1,
  searchTerm = "",
  filterType = "todos"
) => {
  try {
    // Pasar el 'filterType' al backend como parámetro de la consulta
    const response = await api.get(
      `${API_URL}?page=${page}&search=${searchTerm}&filter_type=${filterType}`,
      getAuthHeaders()
    );
    const citas = response.data.results || response.data; // Asegúrate de usar la respuesta directamente si no hay 'results'

    const citasOrdenadas = citas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.finalizar}`);
      const fechaB = new Date(`${b.fecha}T${b.finalizar}`);
      return fechaB - fechaA; // Ordenar de la más reciente a la más antigua
    });

    return citasOrdenadas || [];
  } catch (error) {
    handleApiError(error, "Obtener las citas");
  }
};

// Función para obtener una cita específica por su ID
export const getCitaDetail = async (id) => {
  try {
    const response = await api.get(`${API_URL}${id}/`, getAuthHeaders());
    return response.data; // Retorna los datos de la cita
  } catch (error) {
    handleApiError(error, "Detalles de una cita");
  }
};

// Obtener todas las citas de un paciente por su ID
export const fetchCitasPorPaciente = async (pacienteId) => {
  try {
    const response = await api.get(`${API_URL}pacientes/${pacienteId}/citas/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las citas del paciente:", error);
    throw error;
  }
};

// Función para crear una nueva cita
export const createCita = async (citaData) => {
  try {
    const response = await api.post(API_URL, citaData, getAuthHeaders());
    return response.data; // Retorna la cita creada
  } catch (error) {
    handleApiError(error, "Crear una cita");
  }
};

// Función para actualizar una cita
export const updateCita = async (id, citaData) => {
  try {
    const response = await api.patch(
      `${API_URL}${id}/`,
      citaData,
      getAuthHeaders()
    );
    return response.data; // Retorna la cita actualizada
  } catch (error) {
    handleApiError(error, "Actualizar una cita");
  }
};

// Función para eliminar una cita
export const deleteCita = async (id) => {
  try {
    const response = await api.delete(`${API_URL}${id}/`, getAuthHeaders());
    return { status: response.status, message: "Cita eliminada con éxito" }; // Retorna la respuesta de eliminación
  } catch (error) {
    handleApiError(error, "Eliminar una cita");
  }
};

// Función enviar whatsApp
export const sendWhatsapp = async (citas_ids) => {
  try {
    console.log("IDs de citas a enviar:", citas_ids); // Asegúrate de que esto sea correcto
    const response = await api.post(
      `${API_URL}enviar-whatsapp/`,
      { citas_ids: citas_ids }, // Asegúrate de enviar un objeto con claves correctas
      getAuthHeaders()
    );
    console.log("Respuesta del backend:", response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error al enviar WhatsApp");
  }
};

// Configurar Precio global citas
// Obtener el precio global de las citas
export const obtenerPrecioGlobal = async () => {
  try {
    const response = await api.get(`${API_URL}configurar-precio/`);
    return response.data.precio_global;
  } catch (error) {
    console.error("Error al obtener el precio global:", error);
    throw error;
  }
};

// Actualizar el precio global de las citas
export const actualizarPrecioGlobal = async (nuevoPrecio) => {
  try {
    const response = await api.put(`${API_URL}configurar-precio/`, {
      precio_global: nuevoPrecio,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el precio global:", error);
    throw error;
  }
};
