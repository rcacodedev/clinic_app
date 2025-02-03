// finanzasService.js
import api from './api'; // importa la configuración de axios que ya tienes

const URL_BACKEND = '/api/finanzas/';

// Obtener las ganancias de las citas
export const getGananciasCitas = async (filtro = 'total', page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`${URL_BACKEND}ganancias-citas/?filtro=${filtro}&page=${page}&page_size=${pageSize}`);
    return response.data; // Retorna los datos de las ganancias de las citas
  } catch (error) {
    console.error("Error al obtener las ganancias de las citas:", error);
    throw error; // Lanza el error para que se maneje donde se llame esta función
  }
};

// Crear una ganancia para una cita específica
export const crearGananciaCita = async (cita_id, data) => {
  try {
    const response = await api.post(`${URL_BACKEND}ganancias-citas/${cita_id}/`, data);
    return response.data; // Retorna los datos de la ganancia creada
  } catch (error) {
    console.error("Error al crear una ganancia para la cita:", error);
    throw error;
  }
};

// Marcar una cita como cotizada
export const marcarCitaCotizada = async (cita_id) => {
  try {
    const response = await api.post(`${URL_BACKEND}mark-cotizada/${cita_id}/`);
    return response.data; // Retorna el mensaje de éxito
  } catch (error) {
    console.error("Error al marcar la cita como cotizada:", error);
    throw error;
  }
};

// Obtener citas que han sido registradas
export const fetchEstadosIngresos = async () => {
  try {
    const response = await api.get(`${URL_BACKEND}estado-ingresos/`);
    return response.data;
  } catch (error) {
    console.log("Error al obtener citas registradas:", error)
    throw error;
  }
}

// Crear un gasto
export const crearGasto = async (data) => {
  try {
    const response = await api.post(`${URL_BACKEND}gasto/`, data);
    return response.data; // Retorna los datos del gasto creado
  } catch (error) {
    console.error("Error al crear un gasto:", error);
    throw error;
  }
};

// Listar los gastos
export const getGastos = async (filtro = 'total', page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`${URL_BACKEND}gastos/?filtro=${filtro}&page=${page}&page_size=${pageSize}`);
    return response.data; // Retorna la lista de los gastos
  } catch (error) {
    console.error("Error al obtener los gastos:", error);
    throw error;
  }
};

// Obtener configuración de finanzas
export const getConfiguracionFinanzas = async () => {
  try {
    const response = await api.get(`${URL_BACKEND}configuracion/`);
    return response.data; // Retorna los datos de la configuración de finanzas
  } catch (error) {
    console.error("Error al obtener la configuración de finanzas:", error);
    throw error;
  }
};

export const putConfiguracionFinanzas = async (newPrecio) =>{
  try {
    const response = await api.put(`${URL_BACKEND}configuracion/`, {precio_cita_base: newPrecio});
    return response.data; // Retorna los datos de la configuración de finanzas
  } catch (error) {
    console.error("Error al obtener la configuración de finanzas:", error);
    throw error;
  }
};

// Obtener balance de finanzas
export const getBalanceFinanzas = async (filtro = 'total', page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`${URL_BACKEND}balance/?filtro=${filtro}&page=${page}&page_size=${pageSize}`);
    return response.data; // Retorna el balance de finanzas
  } catch (error) {
    console.error("Error al obtener el balance de finanzas:", error);
    throw error;
  }
};
