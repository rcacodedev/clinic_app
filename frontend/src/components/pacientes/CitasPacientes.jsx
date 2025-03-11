import React, { useEffect, useState } from "react";
import citasService from "../../services/citasService";
import Boton from '../Boton'
import { Link } from "react-router-dom";
import '../../styles/pacientes/citasPacientes.css'

function PatientAppointments({ patientId, refreshAppointments }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función de formato de fecha y hora
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida"; // Comprobar si la fecha es nula o vacía

    // Si la entrada es solo una fecha (YYYY-MM-DD), formatearla adecuadamente
    if (dateString.length === 10) { // Formato "YYYY-MM-DD"
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida"; // Para el caso de formatos incorrectos
      }
      return date.toLocaleDateString('es-ES'); // Solo la fecha
    }

    // Si la entrada es una hora (HH:mm:ss), devolverla como hora
    if (dateString.length === 8) { // Formato "HH:mm:ss"
      return dateString.substring(0, 5); // Regresamos la hora tal como está
    }

    // Caso general para manejar fecha y hora
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida"; // Para el caso de formatos incorrectos
    }

    return date.toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  // Función para cargar las citas
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await citasService.getCitas();
      const citasPaciente = data.filter(cita => String(cita.patient) === String(patientId));

      // Asegúrate de que las fechas se formateen correctamente
      const citasConFechaFormateada = citasPaciente.map(cita => ({
        ...cita,
        fecha: formatDate(cita.fecha),
        comenzar: formatDate(cita.comenzar),
        finalizar: formatDate(cita.finalizar),
      }));

      setAppointments(citasConFechaFormateada);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setError("Error al cargar las citas.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(); // Llamar a la función para obtener las citas
  }, [patientId, refreshAppointments]); // Dependencia: refrescar cuando `patientId` o `refreshAppointments` cambian

  if (loading) return <div className="loading">Cargando citas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="appointments-section">
      <h2>Citas del Paciente</h2>
      <div className="appointments-list">
        {appointments.length === 0 ? (
          <p>No hay citas programadas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora de Comienzo</th>
                <th>Hora de Finalización</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={index}>
                  <td>{appointment.fecha}</td>
                  <td>{appointment.comenzar}</td>
                  <td>{appointment.finalizar}</td>
                  <td>{appointment.descripcion}</td>
                  <td>
                    <Link to={`/api/citas/${appointment.id}`}>
                        <Boton texto="Ver Cita" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PatientAppointments;
