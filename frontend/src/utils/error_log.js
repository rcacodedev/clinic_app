export const handleApiError = (error, action = 'procesar la solicitud') => {
    console.error(`Error al ${action}:`, error.response?.data || error.message);
    throw error;
  };