import React, { useEffect, useState } from "react";
import { fetchCitasPorPaciente } from "../../services/citasService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PatientAppointments({ patientId, refreshAppointments }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const meses = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // Años entre 2020 y el actual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

  const navigate = useNavigate();

  // Función de formato de fecha y hora
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida";

    if (dateString.length === 10) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-ES");
    }

    if (dateString.length === 8) {
      return dateString.substring(0, 5);
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

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
      const data = await fetchCitasPorPaciente(patientId);

      // Agregar fechaOriginal para filtrar correctamente
      const citasConFechaFormateada = data.map((cita) => ({
        ...cita,
        fechaOriginal: cita.fecha, // guardamos la fecha original para el filtro
        fecha: formatDate(cita.fecha),
        comenzar: formatDate(cita.comenzar),
        finalizar: formatDate(cita.finalizar),
      }));

      setAppointments(citasConFechaFormateada);

      // Opcional: calcular totalPages si paginas backend o tú quieres paginar
      setTotalPages(1); // Ajusta según la lógica de paginación que uses
    } catch (error) {
      console.error("Error al cargar citas:", error);
      toast.error("Error al cargar las citas del paciente");
      setAppointments([]);
      setError("Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId, refreshAppointments]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Ahora sí usamos fechaOriginal para filtrar
  const filteredAppointments = appointments.filter((appointment) => {
    if (!appointment.fechaOriginal) return false;

    const date = new Date(appointment.fechaOriginal);
    if (isNaN(date.getTime())) return false;

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    const matchMonth = selectedMonth ? month === selectedMonth : true;
    const matchYear = selectedYear ? year === selectedYear : true;

    return matchMonth && matchYear;
  });

  if (loading) return <div className="loading">Cargando citas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container-proteccion-datos">
      <h4 className="title-section">Citas del paciente</h4>
      <div className="container-filtro">
        <div className="section-filtro">
          <label className="label-filtro" htmlFor="filtro-mes">
            Mes:{" "}
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            id="filtro-mes"
            name="mes"
            className="select-filtro"
          >
            <option value="">Todos</option>
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
          <div className="flecha-filtro">▼</div>
        </div>

        <div className="section-filtro">
          <label className="label-filtro" htmlFor="filtro-ano">
            Año:{" "}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            id="filtro-ano"
            name="ano"
            className="select-filtro"
          >
            <option value="">Todos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="flecha-filtro">▼</div>
        </div>
      </div>

      <div className="table-container mt-5">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            {filteredAppointments.length === 0 ? (
              <p className="text-center mt-4">
                No hay citas para los filtros seleccionados.
              </p>
            ) : (
              <table className="table-pacientes">
                <thead className="thead-pacientes">
                  <tr>
                    <th>Fecha</th>
                    <th>Comenzar</th>
                    <th>Finalizar</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody className="tbody-pacientes">
                  {filteredAppointments.map((appointment, index) => (
                    <tr key={index}>
                      <td>{appointment.fecha}</td>
                      <td>{appointment.comenzar}</td>
                      <td>{appointment.finalizar}</td>
                      <td>{appointment.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Paginación */}
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
