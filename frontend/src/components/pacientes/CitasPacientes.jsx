import React, { useEffect, useState } from "react";
import { getCitas } from "../../services/citasService";
import { useNavigate } from "react-router-dom";

function PatientAppointments({ patientId, refreshAppointments }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // Función de formato de fecha y hora
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida"; // Comprobar si la fecha es nula o vacía

    // Si la entrada es solo una fecha (YYYY-MM-DD), formatearla adecuadamente
    if (dateString.length === 10) {
      // Formato "YYYY-MM-DD"
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida"; // Para el caso de formatos incorrectos
      }
      return date.toLocaleDateString("es-ES"); // Solo la fecha
    }

    // Si la entrada es una hora (HH:mm:ss), devolverla como hora
    if (dateString.length === 8) {
      // Formato "HH:mm:ss"
      return dateString.substring(0, 5); // Regresamos la hora tal como está
    }

    // Caso general para manejar fecha y hora
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida"; // Para el caso de formatos incorrectos
    }

    return date.toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Función para cargar las citas
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCitas();
      const citasPaciente = data.filter(
        (cita) => String(cita.patient) === String(patientId)
      );

      // Asegúrate de que las fechas se formateen correctamente
      const citasConFechaFormateada = citasPaciente.map((cita) => ({
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

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) return <div className="loading">Cargando citas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container-proteccion-datos">
      <h4 className="title-section">Citas del paciente</h4>
      <div className="table-container mt-5">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            {appointments.length === 0 ? (
              <p className="text-center mt-4">No hay citas programadas.</p>
            ) : (
              <table className="table-pacientes">
                <thead className="thead-pacientes">
                  <tr>
                    <th>Fecha</th>
                    <th>Comenzar</th>
                    <th>Finalizar</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="tbody-pacientes">
                  {appointments.map((appointment, index) => (
                    <tr key={index}>
                      <td>{appointment.fecha}</td>
                      <td>{appointment.comenzar}</td>
                      <td>{appointment.finalizar}</td>
                      <td>{appointment.descripcion}</td>
                      <td className="px-6 py-4">
                        <div className="btn-actions-container">
                          <button
                            className="btn-toogle"
                            onClick={() =>
                              navigate(`/pacientes/${appointment.patient}`)
                            }
                          >
                            Perfil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Paginación (si la usas) */}
            <div className="pagination-container">
              <span className="span-pagination">
                Página {page} de {totalPages}
              </span>
              <div className="pagination-btn-container">
                <button
                  className="pagination-flecha"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  aria-label="Página anterior"
                >
                  «
                </button>

                <button className="pagination-number" aria-current="page">
                  {page}
                </button>

                <button
                  className="pagination-flecha"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;
