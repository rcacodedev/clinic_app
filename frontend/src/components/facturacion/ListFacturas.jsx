import React, { useState, useEffect } from 'react';
import { getFacturas, getFacturasPDF, deleteFactura } from '../../services/facturaService';
import Boton from '../Boton';
import Notification from '../Notification';


const ListFacturas = () => {
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
            setLoading(true);
            try {
                const data = await getFacturas(page);
                setFacturas(data.results);
                setTotalPages(data.total_pages);
            } catch (error) {
                setError("Error al cargar las facturas", error);
            } finally {
                setLoading(false);
            }
        };
        loadFacturas();
    }, [page]);

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
            const response = await getFacturasPDF(facturaId);

            // Verificar si la respuesta es realmente un Blob de tipo PDF
            if (response.type !== "application/pdf") {
                const errorText = await response.text(); // Intentar leer el contenido del error
                console.error("Respuesta inesperada del servidor:", errorText);
                return;
            }

            const pdfURL = URL.createObjectURL(response);
            window.open(pdfURL, '_blank');
        } catch (error) {
            console.error('Error al mostrar el PDF:', error);
        }
    }

    // Funcion para eliminar factura
    const handleEliminarFactura = async (facturaId) => {
        const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar esta factura?");
        if (confirmacion) {
            try {
                // Llamar a la función para eliminar la factura
                await deleteFactura(facturaId);
                // Actualizar el estado para reflejar la eliminación
                setFacturas((prevFacturas) => prevFacturas.filter((factura) => factura.id !== facturaId));
                setNotificationEliminar(true);
            } catch (error) {
                console.error("Error al eliminar la factura:", error);
            }
        }
    };

    return (
        <div className='container-factura'>
            <h1 className='title-section'>Lista de Facturas</h1>
            <div className='fecha-selector'>
                <div className='filtro'>
                    <h4 className='filter-section'>Días</h4>
                    <select name="dia" onChange={handleFechaChange} value={fechaSeleccionada.dia}>
                        <option value="0">Todos</option>
                        {Array.from({ length: new Date(fechaSeleccionada.anio, fechaSeleccionada.mes + 1, 0).getDate() }, (_, i) => i + 1).map((dia) => (
                            <option key={dia} value={dia}>{dia}</option>
                        ))}
                    </select>
                </div>
                <div className='filtro'>
                    <h4 className='filter-section'>Meses</h4>
                    <select name="mes" onChange={handleFechaChange} value={fechaSeleccionada.mes}>
                        <option value="-1">Todos</option> {/* Agregar opción "Todos" */}
                        {meses.map((mes, index) => (
                            <option key={index} value={index}>{mes}</option>
                        ))}
                    </select>
                </div>
                <div className='filtro'>
                    <h4 className='filter-section'>Años</h4>
                    <select name="anio" onChange={handleFechaChange} value={fechaSeleccionada.anio}>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <option key={index} value={new Date().getFullYear() - index}>{new Date().getFullYear() - index}</option>
                        ))}
                    </select>
                </div>
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

export default ListFacturas;
