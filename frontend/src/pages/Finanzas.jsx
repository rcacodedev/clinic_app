import React, { useState, useEffect } from 'react';
import { getConfiguracionFinanzas, putConfiguracionFinanzas } from '../services/finanzasService';
import CitasFinalizadas from '../components/finanzas/ListCitasFInalizadas';
import Gastos from '../components/finanzas/Gastos';
import Balances from '../components/finanzas/Balances';
import { getToken, getUserIdFromToken } from '../utils/auth';
import citasService from '../services/citasService';
import '../styles/finanzas/finanzas.css'

const Finanzas = () => {
  // Estados para el precio actual y el nuevo precio
  const [precioCita, setPrecioCita] = useState(null);
  const [nuevoPrecioCita, setNuevoPrecioCita] = useState('');
  const [citas, setCitas] = useState([]);

  // Obtener ID del user
  const token = getToken();
  const userId = getUserIdFromToken(token)

  // Cargar lista de citas Finalizadas

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await citasService.getCitas();
        setCitas(response);
      } catch (error) {
        console.error('Error al cargar las citas:', error)
      }
    }

    fetchCitas();
  }, [])

  // Cargar configuración al montar el componente
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const config = await getConfiguracionFinanzas();
        if (config.precio_cita_base !== undefined && !isNaN(config.precio_cita_base)) {
          setPrecioCita(config.precio_cita_base);  // Asignar precio actual
          setNuevoPrecioCita(config.precio_cita_base.toString()); // Asegurar que sea string para el input
        } else {
          console.error("Precio de cita no válido:", config.precio_cita_base);
        }
      } catch (error) {
        console.error("Error al obtener la configuración:", error);
      }
    };

    fetchConfiguracion();
  }, []);

  // Manejar cambio en el input
  const handleChange = (event) => {
    setNuevoPrecioCita(event.target.value);
  };

  // Enviar la solicitud PUT al backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Asegúrate de que el valor se convierte a número
    const precioNumerico = parseFloat(nuevoPrecioCita);

    // Verificar si el precio ingresado es válido
    if (isNaN(precioNumerico)) {
      console.error("El precio ingresado no es un número válido");
      return;
    }

    try {
      // Realizar la solicitud PUT al backend con el nuevo precio
      const response = await putConfiguracionFinanzas(precioNumerico);

      // Si la respuesta es exitosa, actualiza el estado
      if (response) {
        setPrecioCita(precioNumerico);  // Actualiza el estado con el nuevo precio
      }
    } catch (error) {
      console.error("Error al actualizar el precio de las citas:", error);
    }
  };

  return (
    <div className='main-content'>
      <h1>Configuración de Finanzas</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="precioCita">Precio Actual de las Citas:</label>
          <input
            type="number"
            id="precioCita"
            value={nuevoPrecioCita || ''}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        <button type="submit">Actualizar Precio</button>
      </form>

      <div className='citas-finalizadas-container'>
        <CitasFinalizadas citas={citas} userId={userId} valorCita={precioCita}/>
      </div>

      <div className='lista-gastos'>
        <Gastos/>
      </div>

      <div className='balances'>
        <Balances/>
      </div>
    </div>

  );
};

export default Finanzas;
