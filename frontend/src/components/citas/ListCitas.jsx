import React, { useState, useEffect, useRef } from "react";
import { getCitas, updateCita, deleteCita } from "../../services/citasService";
import { createFactura } from "../../services/facturaService";
import { toast } from "react-toastify";
import EditarCitaLista from "../citas/EditarCitaLista";

const ListaCitas = ({ citas, userId }) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [citasState, setCitasState] = useState(citas);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const firstInputRef = useRef(null);
  const [citasReload, setCitasReload] = useState([]);
  const hoy = new Date();
  const [fechaSeleccionada, setFechaSeleccionada] = useState({
    dia: 0,
    mes: hoy.getMonth(),
    anio: hoy.getFullYear(),
  });

  const loadCitas = async () => {
    try {
      const data = await getCitas();
      setCitasReload(data);
    } catch (error) {
      console.error("Error al cargar las citas", error);
    }
  };

  useEffect(() => {
    setCitasState(citas);
  }, [citas]);
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  /* Editar Cita */
  // Abre el modal y setea la cita seleccionada
  const handleEditarClick = (cita) => {
    setCitaSeleccionada(cita);
    setIsEditModalOpen(true);
  };

  // Cierra el modal y limpia la cita seleccionada
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setCitaSeleccionada(null);
    loadCitas();
  };

  // Maneja el cambio en el formulario dentro del modal
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCitaSeleccionada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleDeleteConfirmed = async (cita) => {
    try {
      await deleteCita(cita.id); // Usa 'pk' si corresponde
      toast.success("Cita eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      toast.error("Error al eliminar la cita");
    }
  };
  // Guarda los cambios de la cita (puedes ajustar para llamar a tu API)
  const handleSave = async (updatedCita) => {
    try {
      await updateCita(updatedCita.id, updatedCita); // Asegúrate que updateCita acepte id y datos
      toast.success("Cita actualizada correctamente");

      // Actualiza el estado local para mostrar la cita editada sin recargar
      setCitasState((prev) =>
        prev.map((cita) =>
          cita.id === updatedCita.id ? { ...updatedCita } : cita
        )
      );

      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      toast.error("Error al actualizar la cita");
    }
  };

  // Funcion generar facturas
  const handleCrearFactura = async (tipo, cita) => {
    try {
      const id = cita.id;

      // Paso 1: actualizar la cita (cotizada o irpf en true)
      const datosActualizados = { ...cita };
      if (tipo === "cotizada") {
        datosActualizados.cotizada = true;
      } else if (tipo === "irpf") {
        datosActualizados.irpf = true;
      }

      const citaActualizada = await updateCita(id, datosActualizados);
      console.log("Cita actualizada:", citaActualizada);

      // Paso 2: crear la factura después de la actualización
      const facturaData = { cita: id };
      const facturas = await createFactura(facturaData);

      const creada = facturas.find((f) => {
        if (tipo === "cotizada") return true;
        if (tipo === "irpf") return true;
        return false;
      });

      if (creada) {
        alert(
          `Factura ${tipo.toUpperCase()} creada correctamente. Nº: ${
            creada.numero_factura
          }`
        );
      } else {
        alert(`No se creó factura ${tipo.toUpperCase()}.`);
      }
    } catch (error) {
      console.error(`Error al crear factura ${tipo}:`, error);
      alert(`Error al crear factura ${tipo.toUpperCase()}`);
    }
  };

  const handleFechaChange = (e) => {
    const { name, value } = e.target;
    const nuevaFecha = {
      ...fechaSeleccionada,
      [name]: parseInt(value),
    };
    setFechaSeleccionada(nuevaFecha);

    // Filtrar citas aquí
    const citasFiltradas = citas.filter((cita) => {
      const fechaCita = new Date(cita.fecha);
      const mismoAnio = fechaCita.getFullYear() === nuevaFecha.anio;
      const mismoMes =
        nuevaFecha.mes === -1 || fechaCita.getMonth() === nuevaFecha.mes;
      const mismoDia =
        nuevaFecha.dia === 0 || fechaCita.getDate() === nuevaFecha.dia;

      return mismoAnio && mismoMes && mismoDia;
    });

    setCitasState(citasFiltradas);
  };
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div className="list-citas">
      <h2 className="title-section mt-5 mb-5">Historial de citas</h2>
      <div className="container-filtro">
        <div className="section-filtro">
          <label htmlFor="filtro-dia" className="label-filtro">
            Días
          </label>
          <select
            id="filtro-dia"
            name="dia"
            onChange={handleFechaChange}
            value={fechaSeleccionada.dia}
            className="select-filtro"
          >
            <option value="0">Todos</option>
            {Array.from(
              {
                length: new Date(
                  fechaSeleccionada.anio,
                  fechaSeleccionada.mes + 1,
                  0
                ).getDate(),
              },
              (_, i) => i + 1
            ).map((dia) => (
              <option key={dia} value={dia}>
                {dia}
              </option>
            ))}
          </select>
          <div className="flecha-filtro">▼</div>
        </div>

        <div className="section-filtro">
          <label htmlFor="filtro-mes" className="label-filtro">
            Meses
          </label>
          <select
            id="filtro-mes"
            name="mes"
            onChange={handleFechaChange}
            value={fechaSeleccionada.mes}
            className="select-filtro"
          >
            <option value="-1">Todos</option>
            {meses.map((mes, index) => (
              <option key={index} value={index}>
                {mes}
              </option>
            ))}
          </select>
          <div className="flecha-filtro">▼</div>
        </div>

        <div className="section-filtro">
          <label htmlFor="filtro-anio" className="label-filtro">
            Año
          </label>
          <select
            id="filtro-anio"
            name="anio"
            onChange={handleFechaChange}
            value={fechaSeleccionada.anio}
            className="select-filtro"
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <option key={index} value={new Date().getFullYear() - index}>
                {new Date().getFullYear() - index}
              </option>
            ))}
          </select>
          <div className="flecha-filtro">▼</div>
        </div>
      </div>
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
                      <td className="tbodytd-pacientes">
                        {cita.paciente_nombre}
                      </td>
                      <td className="tbodytd-pacientes">{cita.fecha}</td>
                      <td className="tbodytd-pacientes">{cita.comenzar}</td>
                      <td className="tbodytd-pacientes">{cita.descripcion}</td>
                      <td className="px-6 py-4">
                        <div className="btn-actions-container">
                          <button
                            className="btn-toogle"
                            onClick={() => handleEditarClick(cita)}
                          >
                            Editar
                          </button>
                          <div className="w-px h-6 bg-gray-300 mx-2"></div>
                          <button
                            className="btn-toogle"
                            onClick={() => handleCrearFactura("cotizada", cita)}
                          >
                            Crear Cotizada
                          </button>

                          <button
                            className="btn-toogle"
                            onClick={() => handleCrearFactura("irpf", cita)}
                          >
                            Crear IRPF
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

      {isEditModalOpen && citaSeleccionada && (
        <EditarCitaLista
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          formData={citaSeleccionada}
          onChange={handleFormChange}
          firstInputRef={firstInputRef}
          setFormData={setCitaSeleccionada}
          onDelete={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default ListaCitas;
