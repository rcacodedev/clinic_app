import React, { useState, useEffect, useCallback } from 'react';
import { getFacturasByPatient, getFacturasPDF, deleteFactura } from '../../services/facturaService';
import Boton from '../Boton';
import Notification from '../Notification';
import '../../styles/facturacion/listFacturas.css'

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
                const data = await getFacturasByPatient(patientId, fechaSeleccionada.mes, fechaSeleccionada.anio, page);

                if (!data || !data.results) {
                    console.error("Error: Respuesta inesperada de la API", data);
                    setError("Datos de facturas inválidos.");
                    return;
                }

                if (data.results.length === 0) {
                    // Si no hay facturas, mostrar un mensaje informativo en lugar de un error
                    setError("Este paciente no tiene facturas.");
                    setFacturas([]);
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
        return facturas.filter(factura => {
            const fechaFactura = new Date(factura.fecha_creacion);
            const diaFactura = fechaFactura.getDate();
            const mesFactura = fechaFactura.getMonth(); // Mes en formato 0-11
            const anioFactura = fechaFactura.getFullYear();

            const mismoDia = fechaSeleccionada.dia === "0" || diaFactura === parseInt(fechaSeleccionada.dia);
            const mismoMes = fechaSeleccionada.mes === "-1" || mesFactura === parseInt(fechaSeleccionada.mes);
            const mismoAnio = anioFactura === parseInt(fechaSeleccionada.anio);

            return mismoDia && mismoMes && mismoAnio;
        });
    };

    const handleFechaChange = (e) => {
        const { name, value } = e.target;
        setFechaSeleccionada(prevState => ({
            ...prevState,
            [name]: value
        }));
        setPage(1); // Reiniciar a la primera página
    };


    const handlePagination = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return; // Evitar páginas fuera del rango
        setPage(newPage);
    };

    // Filtrar las facturas según la fecha seleccionada
    const facturasFiltradas = filtrarFacturasPorFecha(facturas, fechaSeleccionada);
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

    // Función para mostrar el PDF
    const handlePDF = async (facturaId) => {
        try {
            const pdf = await getFacturasPDF(facturaId);
            const pdfURL = URL.createObjectURL(pdf);
            window.open(pdfURL, '_blank');
        } catch (error) {
            console.error('Error al mostrar el PDF', error)
        }
    }


    // Funcion para eliminar factura
    const handleEliminarFactura = async (facturaId) => {
        const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar esta factura?");
        if (confirmacion) {
            try {
                await deleteFactura(facturaId);
                setFacturas((prevFacturas) => {
                    const newFacturas = prevFacturas.filter((factura) => factura.id !== facturaId);
                    if (newFacturas.length === 0 && page > 1) {
                        setPage(page - 1); // Si la última factura en la página se borra, retrocede una página
                    }
                    return newFacturas;
                });
                setNotificationEliminar(true);
            } catch (error) {
                console.error("Error al eliminar la factura:", error);
            }
        }
    };


    return (
        <div className='container-factura'>
            <h1>Lista de Facturas</h1>
            <div className="fecha-selector">
                <h1>Días</h1>
                <select name="dia" onChange={handleFechaChange} value={fechaSeleccionada.dia}>
                    <option value="0">Todos</option>
                    {Array.from({ length: new Date(fechaSeleccionada.anio, fechaSeleccionada.mes + 1, 0).getDate() }, (_, i) => i + 1).map((dia) => (
                        <option key={dia} value={dia}>{dia}</option>
                    ))}
                </select>
                <h1>Meses</h1>
                <select name="mes" onChange={handleFechaChange} value={fechaSeleccionada.mes}>
                    <option value="-1">Todos</option> {/* Agregar opción "Todos" */}
                    {meses.map((mes, index) => (
                        <option key={index} value={index}>{mes}</option>
                    ))}
                </select>
                <h1>Años</h1>
                <select name="anio" onChange={handleFechaChange} value={fechaSeleccionada.anio}>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <option key={index} value={new Date().getFullYear() - index}>{new Date().getFullYear() - index}</option>
                    ))}
                </select>
            </div>

            {loading && <p className='loading'>Cargando facturas...</p>}
            {error && <p className='error'>{error}</p>}

            <table className='tabla-facturas'>
                <thead>
                    <tr>
                        <th>Nº Factura</th>
                        <th>Fecha</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {facturasFiltradas.map((factura) => (
                        <tr key={factura.id}>
                            <td>{factura.numero_factura}</td>
                            <td>{new Date(factura.fecha_creacion).toLocaleDateString()}</td>
                            <td>{factura.total}</td>
                            <td>
                                <Boton texto="PDF" onClick={() => handlePDF(factura.id)}/>
                                <Boton texto="Eliminar" onClick={() => handleEliminarFactura(factura.id)}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='paginacion'>
                <Boton onClick={() => handlePagination(page - 1)} disabled={page === 1} texto="Anterior" />
                <span>{page}</span>
                <Boton
                    onClick={() => handlePagination(page + 1)}
                    disabled={page === totalPages || facturas.length < 10} // Deshabilitar si ya no hay más páginas
                    texto="Siguiente"
                />
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
