import React, { useState, useEffect, useCallback } from "react";
import {
  getFacturasByPatient,
  getFacturasPDF,
  deleteFactura,
} from "../../services/facturaService";
import { toast } from "react-toastify";
import Notification from "../Notification";

const ListFacturasPatients = ({ patientId }) => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fechaSeleccionada, setFechaSeleccionada] = useState({
    dia: "0", // Todos
    mes: "-1", // Todos
    anio: new Date().getFullYear().toString(),
  });
  const [notificationEliminar, setNotificationEliminar] = useState(false);

  useEffect(() => {
    const loadFacturas = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null); // Resetear errores antes de hacer la solicitud

      try {
        const data = await getFacturasByPatient(
          patientId,
          fechaSeleccionada.mes,
          fechaSeleccionada.anio,
          page
        );

        if (!data || !data.results) {
          console.error("Error: Respuesta inesperada de la API", data);
          toast.error("Datos de la factura inválidos.");
          setError("Datos de facturas inválidos.");
          return;
        }

        setFacturas(data.results);
        setTotalPages(data.total_pages);
      } catch (error) {
        // Aquí solo manejarías errores inesperados
        console.error("Error en loadFacturas:", error);
        setError("Error al cargar las facturas");
      } finally {
        setLoading(false);
      }
    };

    loadFacturas();
  }, [patientId, fechaSeleccionada, page]);

  // Función de filtrado de facturas
  const filtrarFacturasPorFecha = (facturas, fechaSeleccionada) => {
    return facturas.filter((factura) => {
      const fechaFactura = new Date(factura.fecha_creacion);
      const diaFactura = fechaFactura.getDate();
      const mesFactura = fechaFactura.getMonth(); // Mes en formato 0-11
      const anioFactura = fechaFactura.getFullYear();

      const mismoDia =
        fechaSeleccionada.dia === "0" ||
        diaFactura === parseInt(fechaSeleccionada.dia);
      const mismoMes =
        fechaSeleccionada.mes === "-1" ||
        mesFactura === parseInt(fechaSeleccionada.mes);
      const mismoAnio = anioFactura === parseInt(fechaSeleccionada.anio);

      return mismoDia && mismoMes && mismoAnio;
    });
  };

  const handleFechaChange = (e) => {
    const { name, value } = e.target;
    setFechaSeleccionada((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setPage(1); // Reiniciar a la primera página
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Filtrar las facturas según la fecha seleccionada
  const facturasFiltradas = filtrarFacturasPorFecha(
    facturas,
    fechaSeleccionada
  );
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

  // Función para mostrar el PDF
  const handlePDF = async (facturaId) => {
    try {
      const pdf = await getFacturasPDF(facturaId);
      const pdfURL = URL.createObjectURL(pdf);
      window.open(pdfURL, "_blank");
    } catch (error) {
      console.error("Error al mostrar el PDF", error);
    }
  };

  // Funcion para eliminar factura
  const handleEliminarFactura = async (facturaId) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que quieres eliminar esta factura?"
    );
    if (confirmacion) {
      try {
        await deleteFactura(facturaId);
        setFacturas((prevFacturas) => {
          const newFacturas = prevFacturas.filter(
            (factura) => factura.id !== facturaId
          );
          if (newFacturas.length === 0 && page > 1) {
            setPage(page - 1); // Si la última factura en la página se borra, retrocede una página
          }
          return newFacturas;
        });
        toast.success("Factura eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la factura:", error);
        toast.error("Error al eliminar la factura");
      }
    }
  };

  return (
    <div className="container-proteccion-datos mt-5">
      <h1 className="title-section mt-5">Lista de Facturas</h1>
      <div className="flex flex-wrap gap-4 items-start mt-5">
        {/* Día */}
        <div className="relative w-20 h-20">
          <label
            htmlFor="filtro-dia"
            className="block text-sm font-medium text-gray-700 mb-1 text-center"
          >
            Día
          </label>
          <select
            id="filtro-dia"
            name="dia"
            onChange={handleFechaChange}
            value={fechaSeleccionada.dia}
            className="h-10 border border-gray-300 text-gray-900 pl-4 pr-8 text-sm rounded-lg block w-full bg-white appearance-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-300"
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
          <div className="pointer-events-none absolute top-8 right-3 text-gray-500">
            ▼
          </div>
        </div>

        {/* Mes */}
        <div className="relative w-20">
          <label
            htmlFor="filtro-mes"
            className="block text-sm font-medium text-gray-700 mb-1 text-center"
          >
            Mes
          </label>
          <select
            id="filtro-mes"
            name="mes"
            onChange={handleFechaChange}
            value={fechaSeleccionada.mes}
            className="h-10 border border-gray-300 text-gray-900 pl-4 pr-8 text-sm rounded-lg block w-full bg-white appearance-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-300"
          >
            <option value="-1">Todos</option>
            {meses.map((mes, index) => (
              <option key={index} value={index}>
                {mes}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-8 right-3 text-gray-500">
            ▼
          </div>
        </div>

        {/* Año */}
        <div className="relative w-20">
          <label
            htmlFor="filtro-anio"
            className="block text-sm font-medium text-gray-700 mb-1 text-center"
          >
            Año
          </label>
          <select
            id="filtro-anio"
            name="anio"
            onChange={handleFechaChange}
            value={fechaSeleccionada.anio}
            className="h-10 border border-gray-300 text-gray-900 pl-4 pr-8 text-sm rounded-lg block w-full bg-white appearance-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-300"
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <option key={index} value={new Date().getFullYear() - index}>
                {new Date().getFullYear() - index}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-8 right-3 text-gray-500">
            ▼
          </div>
        </div>
      </div>

      {loading && <p className="loading">Cargando facturas...</p>}

      <div className="table-container mt-5">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            {facturasFiltradas.length === 0 ? (
              <p className="text-center mt-4">
                Este paciente aún no tiene facturas.
              </p>
            ) : (
              <table className="table-pacientes">
                <thead className="thead-pacientes">
                  <tr>
                    <th>Nº Factura</th>
                    <th>Fecha</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                {facturasFiltradas.map((factura) => (
                  <tr key={factura.id}>
                    <td>{factura.numero_factura}</td>
                    <td>
                      {new Date(factura.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td>{factura.total}</td>
                    <td className="px-6 py-4">
                      <div className="btn-actions-container">
                        <button
                          className="btn-toogle"
                          onClick={() => handlePDF(factura.id)}
                        >
                          Perfil
                        </button>
                        <button
                          className="btn-toogle"
                          onClick={() => handleEliminarFactura(factura.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <Notification
        message="Factura eliminada correctamente"
        isVisible={notificationEliminar}
        onClose={() => setNotificationEliminar(false)}
        type="success"
      />
    </div>
  );
};

export default ListFacturasPatients;
