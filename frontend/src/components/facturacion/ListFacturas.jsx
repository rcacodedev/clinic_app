import React, { useState, useEffect } from "react";
import {
  getFacturas,
  getFacturasPDF,
  deleteFactura,
} from "../../services/facturaService";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { toast } from "react-toastify";

const ListFacturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fechaSeleccionada, setFechaSeleccionada] = useState({
    dia: "0", // Todos
    mes: "-1", // Todos
    anio: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    const loadFacturas = async () => {
      setLoading(true);
      try {
        const data = await getFacturas(page);
        setFacturas(data.results);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Error al cargar las facturas", error);
        toast.error("Hubo un error al cargar las facturas");
      } finally {
        setLoading(false);
      }
    };
    loadFacturas();
  }, [page]);

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
      const response = await getFacturasPDF(facturaId);

      // Verificar si la respuesta es realmente un Blob de tipo PDF
      if (response.type !== "application/pdf") {
        const errorText = await response.text(); // Intentar leer el contenido del error
        console.error("Respuesta inesperada del servidor:", errorText);
        return;
      }

      const pdfURL = URL.createObjectURL(response);
      window.open(pdfURL, "_blank");
    } catch (error) {
      console.error("Error al mostrar el PDF:", error);
      toast.error("Hubo un error al mostrar el PDF");
    }
  };

  // Funcion para eliminar factura
  const handleEliminarFactura = async (facturaId) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que quieres eliminar esta factura?"
    );
    if (confirmacion) {
      try {
        // Llamar a la función para eliminar la factura
        await deleteFactura(facturaId);
        // Actualizar el estado para reflejar la eliminación
        setFacturas((prevFacturas) =>
          prevFacturas.filter((factura) => factura.id !== facturaId)
        );
        toast.success("Factura eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la factura:", error);
        toast.error("Hubo un error al eliminar la factura");
      }
    }
  };
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleDownloadZip = async () => {
    if (facturasFiltradas.length === 0) {
      toast.info("No hay facturas para descargar en este mes.");
      return;
    }

    const zip = new JSZip();

    // Iteramos sobre facturas filtradas y pedimos el PDF para cada una
    await Promise.all(
      facturasFiltradas.map(async (factura) => {
        try {
          const pdfBlob = await getFacturasPDF(factura.id);
          // Añadir PDF al zip con un nombre adecuado
          zip.file(`Factura_${factura.numero_factura}.pdf`, pdfBlob);
        } catch (error) {
          console.error(
            `Error al obtener PDF de factura ${factura.numero_factura}`,
            error
          );
        }
      })
    );

    // Generar archivo ZIP como blob
    const content = await zip.generateAsync({ type: "blob" });

    // Guardar ZIP en el cliente
    saveAs(
      content,
      `Facturas_${meses[parseInt(fechaSeleccionada.mes)]}_${
        fechaSeleccionada.anio
      }.zip`
    );
  };

  return (
    <div className="container-proteccion-datos">
      <h3 className="title-section mb-2">Lista de Facturas</h3>
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
            <option value="-1">Todos</option> {/* Agregar opción "Todos" */}
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
        <button onClick={handleDownloadZip} className="btn-toogle mb-3">
          Descargar ZIP
        </button>
      </div>

      {loading && <p className="loading">Cargando facturas...</p>}

      <div className="table-container">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            {facturasFiltradas.length === 0 ? (
              <p className="text-center mt-4">No hay facturas.</p>
            ) : (
              <table className="table-pacientes">
                <thead className="thead-pacientes">
                  <tr>
                    <th className="th-pacientes">Nº Factura</th>
                    <th className="th-pacientes">Fecha</th>
                    <th className="th-pacientes">Precio</th>
                    <th className="th-pacientes">Acciones</th>
                  </tr>
                </thead>
                <tbody className="tbody-pacientes">
                  {facturasFiltradas.map((factura) => (
                    <tr key={factura.id} className="tbtr-pacientes">
                      <td className="tbodytd-pacientes">
                        {factura.numero_factura}
                      </td>
                      <td className="tbodytd-pacientes">
                        {new Date(factura.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td className="tbodytd-pacientes">{factura.total}</td>
                      <td className="px-6 py-4">
                        <div className="btn-actions-container">
                          <button
                            className="btn-toogle"
                            onClick={() => handlePDF(factura.id)}
                          >
                            PDF
                          </button>

                          <button
                            className="btn-toogle"
                            onClick={() => handleEliminarFactura(factura.id)}
                          >
                            {" "}
                            <svg
                              viewBox="0 0 1024 1024"
                              fill="white"
                              className="w-5 h-5"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M32 241.6c-11.2 0-20-8.8-20-20s8.8-20 20-20l940 1.6c11.2 0 20 8.8 20 20s-8.8 20-20 20L32 241.6zM186.4 282.4c0-11.2 8.8-20 20-20s20 8.8 20 20v688.8l585.6-6.4V289.6c0-11.2 8.8-20 20-20s20 8.8 20 20v716.8l-666.4 7.2V282.4z" />
                              <path d="M682.4 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM367.2 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM524.8 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM655.2 213.6v-48.8c0-17.6-14.4-32-32-32H418.4c-18.4 0-32 14.4-32 32.8V208h-40v-42.4c0-40 32.8-72.8 72.8-72.8H624c40 0 72.8 32.8 72.8 72.8v48.8h-41.6z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
  );
};

export default ListFacturas;
