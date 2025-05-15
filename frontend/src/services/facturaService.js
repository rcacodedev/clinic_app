import api from "./api";
import { getAuthHeaders } from "../utils/auth";
import { handleApiError } from "../utils/error_log";

const URL_BACKEND = '/facturas/'

// Obtener todas las facturas
export const getFacturas = async (filtro = "", page = 1, pageSize = 10) => {
    try {
        const response = await api.get(`${URL_BACKEND}?filtro=${filtro}&page=${page}&page_size=${pageSize}`, getAuthHeaders())
        return response.data;
    } catch (error) {
        handleApiError(error, "Error al obtener las facturas")
    }
};

// Crear una nueva factura
export const createFactura = async (facturaData) => {
    try {
        const response = await api.post(`${URL_BACKEND}`, facturaData, getAuthHeaders())
        return response.data;
    } catch (error) {
        handleApiError(error, "Error al crear la factura")
    }
};

// Obtener pdf de una factura por ID
export const getFacturasPDF = async (facturaId) => {
    try {
        const response = await api.get(`${URL_BACKEND}${facturaId}/pdf/`, {responseType: "blob"}, getAuthHeaders())
        return response.data;
    } catch (error) {
        handleApiError(error, "Error al obtener el PDF de una factura")
    }
};

// Eliminar una factura por su ID
export const deleteFactura = async (facturaId) => {
    try {
        await api.delete(`${URL_BACKEND}${facturaId}/pdf/`, getAuthHeaders())
    } catch (error) {
        handleApiError(error, "Error al eliminar la factura")
    }
};

// Obtener las facturas de un paciente por su ID
export const getFacturasByPatient = async (pacienteID) => {
    try {
        const url = `${URL_BACKEND}paciente/${pacienteID}/`;
        const response = await api.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        // Si el backend responde con un mensaje específico, no lo trates como error
        if (error.response && error.response.data.message === "No hay facturas para este paciente") {
            return []; // Devuelve una lista vacía sin lanzar error
        }
        handleApiError(error, "Error al obtener las facturas del paciente");
        return { results: [], total_pages: 1 };
    }
};

// Ajustar número de facturación
export const setNumeroFactura = async (numero) => {
    try {
        // Asegúrate de que 'numero' es un número (puedes convertirlo a entero si es necesario)
        const numeroValidado = Number(numero);

        if (isNaN(numeroValidado)) {
            throw new Error('El número de factura no es válido');
        }

        const response = await api.put(`${URL_BACKEND}configuracion-factura/`,
            { numero_inicial: numeroValidado }, getAuthHeaders());

        console.log(response);
        return response.data;
    } catch (error) {
        handleApiError(error, 'Error al introducir número de facturación');
    }
};