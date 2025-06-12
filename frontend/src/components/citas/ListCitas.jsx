import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { updateCita } from "../../services/citasService";
import { createFactura } from "../../services/facturaService";

const ListaCitas = ({ citas, userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [citasState, setCitasState] = useState(citas);

  const navigate = useNavigate();

  useEffect(() => {
    setCitasState(citas);
  }, [citas]);
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="list-citas">
      <h2 className="title-section mt-5 mb-5">Historial de citas</h2>
      <div className="table-container">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            <table className="table-pacientes">
              <thead className="thead-pacientes">
                <tr>
                  <th className="th-pacientes">Paciente</th>
                  <th className="th-pacientes">Fecha</th>
                  <th className="th-pacientes">Hora de Comienzo</th>
                  <th className="th-pacientes">Descripción</th>
                  <th className="th-pacientes">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody_pacientes">
                {citasState.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No hay citas disponibles para este mes y año.
                    </td>
                  </tr>
                ) : (
                  citasState.map((cita) => (
                    <tr key={cita.id} className="tbtr-pacientes">
                      <td className="tbodytd-pacientes">{cita.paciente}</td>
                      <td className="tbodytd-pacientes">{cita.fecha}</td>
                      <td className="tbodytd-pacientes">{cita.comenzar}</td>
                      <td className="tbodytd-pacientes">{cita.descripcion}</td>
                      <td className="px-6 py-4">
                        <div className="btn-actions-container">
                          <button
                            className="btn-toogle"
                            onClick={() => navigate(`/citas/${cita.id}`)}
                          >
                            Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
  );
};

export default ListaCitas;
