import React, { useState, useEffect } from 'react';
import Boton from '../Boton';
import { Link } from 'react-router-dom';
import citasService from '../../services/citasService';
import { createFactura } from '../../services/facturaService';
import '../../styles/citas/listCitas.css';

const ListCitas = ({ citas, userId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [fechaSeleccionada, setFechaSeleccionada] = useState({ dia: 0, mes: -1, anio: new Date().getFullYear() });
    const [citasState, setCitasState] = useState(citas);  // Estado para manejar las citas actualizadas
    const citasPorPagina = 15;

    // Filtrar citas del usuario
    const citasDelUsuario = citasState.filter(cita => cita.user_id === userId);

    // Filtrar citas finalizadas
    const citasFinalizadas = citasDelUsuario.filter(cita => {
        const fechaCita = new Date(`${cita.fecha}T${cita.finalizar}`);
        return fechaCita <= new Date();
    });

    // Ordenar citas en orden descendente
    const citasOrdenadas = citasFinalizadas.sort((a, b) => {
        return new Date(`${b.fecha}T${b.finalizar}`) - new Date(`${a.fecha}T${a.finalizar}`);
    });

    // Función para filtrar citas por mes y año seleccionados
    const filtrarCitasPorFechaSeleccionada = (citas, fechaSeleccionada) => {
        return citas.filter(cita => {
            const fechaCita = new Date(`${cita.fecha}T${cita.finalizar}`);
            const diaCita = fechaCita.getDate();
            const mesCita = fechaCita.getMonth();
            const anioCita = fechaCita.getFullYear();

            const mismoDia = fechaSeleccionada.dia ? diaCita === parseInt(fechaSeleccionada.dia) : true;
            const mismoMes = fechaSeleccionada.mes === -1 || mesCita === parseInt(fechaSeleccionada.mes);  // Permitir "Todos"
            const mismoAnio = anioCita === parseInt(fechaSeleccionada.anio);

            return mismoDia && mismoMes && mismoAnio;
        });
    };

    const filtrarCitasPorFiltros = (citas, filtros) => {
        return citas.filter(cita => {
            const cumpleFiltro =
                (!filtros.cotizada || cita.cotizada) &&
                (!filtros.efectivo || cita.efectivo) &&
                (!filtros.bizum || cita.bizum) &&
                (!filtros.pagado || cita.pagado);

            return cumpleFiltro;
        });
    };


    const citasFiltradasPorFecha = filtrarCitasPorFechaSeleccionada(citasOrdenadas, fechaSeleccionada);
    const citasFiltradasFinal = filtrarCitasPorFiltros(citasFiltradasPorFecha, fechaSeleccionada);

    // Paginación
    const indexOfLastCita = currentPage * citasPorPagina;
    const indexOfFirstCita = indexOfLastCita - citasPorPagina;
    const currentCitas = citasFiltradasFinal.slice(indexOfFirstCita, indexOfLastCita);
    const pageNumbers = Array.from({ length: Math.ceil(citasFiltradasFinal.length / citasPorPagina) }, (_, i) => i + 1);

    // Función para cambiar de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Crear un array de meses y años para los selectores
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const anios = Array.from({ length: 10 }, (_, i) => 2020 + i);

    // Función para manejar el cambio en el selector de mes y año
    const handleFechaChange = (e) => {
        const { name, value } = e.target;
        setFechaSeleccionada((prev) => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    };

    const handleFiltroChange = (e) => {
        const { name, checked } = e.target;
        setFechaSeleccionada(prev => ({ ...prev, [name]: checked }));
    };

    useEffect(() => {
        setCitasState(citas);
    }, [citas]);

    // Función para manejar el cambio de toggle y actualizar la cita
    const handleToggleChange = async (citaId, field) => {
        try {
            const cita = citasState.find(cita => cita.id === citaId);
            if (!cita) {
                console.error("Cita no encontrada");
                return;
            }

            const citaData = { [field]: !cita[field] };

            await citasService.updateCita(citaId, citaData);

            setCitasState(prevCitas => {
                const nuevasCitas = prevCitas.map(c =>
                    c.id === citaId ? { ...c, [field]: !c[field] } : c
                );
                return [...nuevasCitas];  // Se crea una nueva referencia para forzar renderizado
            });

            // Si se marca cotizada, se crea la factura
            if(!cita[field]) {
                const facturaData = {
                    cita:citaId,
                    numero_factura: null,
                    total: cita.precio,
                    usuario: userId
                };
                await createFactura(facturaData);
            }
        } catch (error) {
            console.error('Error al actualizar la cita', error);
        }
    };

    return (
        <div className="list-citas">
            <h2>Citas Finalizadas</h2>

            {/* Selector de Mes y Año */}
            <div className="fecha-selector">
                <select name="dia" onChange={handleFechaChange} value={fechaSeleccionada.dia}>
                    <option value="0">Todos</option>
                    {Array.from({ length: new Date(fechaSeleccionada.anio, fechaSeleccionada.mes + 1, 0).getDate() }, (_, i) => i + 1).map((dia) => (
                        <option key={dia} value={dia}>{dia}</option>
                    ))}
                </select>
                <select name="mes" onChange={handleFechaChange} value={fechaSeleccionada.mes}>
                    <option value="-1">Todos</option> {/* Agregar opción "Todos" */}
                    {meses.map((mes, index) => (
                        <option key={index} value={index}>{mes}</option>
                    ))}
                </select>
                <select name="anio" onChange={handleFechaChange} value={fechaSeleccionada.anio}>
                    {anios.map((anio) => (
                        <option key={anio} value={anio}>{anio}</option>
                    ))}
                </select>
            </div>

            <div className="filtros">
                <label>
                    <input
                        type="checkbox"
                        name="cotizada"
                        checked={fechaSeleccionada.cotizada}
                        onChange={handleFiltroChange}
                    />
                    Cotizada
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="efectivo"
                        checked={fechaSeleccionada.efectivo}
                        onChange={handleFiltroChange}
                    />
                    Efectivo
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="bizum"
                        checked={fechaSeleccionada.bizum}
                        onChange={handleFiltroChange}
                    />
                    Bizum
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="pagado"
                        checked={fechaSeleccionada.pagado}
                        onChange={handleFiltroChange}
                    />
                    Pagado
                </label>
            </div>

            <table className='list-citas-table'>
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Fecha</th>
                        <th>Comenzar</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCitas.length === 0 ? (
                        <tr>
                            <td colSpan="5">No hay citas disponibles para este mes y año.</td>
                        </tr>
                    ) : (
                        currentCitas.map((cita) => (
                            <tr key={cita.id}>
                                <td>{cita.patient_name} {cita.patient_primer_apellido}</td>
                                <td>{cita.fecha}</td>
                                <td>{cita.comenzar}</td>
                                <td>
                                    <div className="toggle-buttons">
                                        <button
                                            className={`toggle-btn ${cita.cotizada ? 'active' : ''}`}
                                            onClick={() => handleToggleChange(cita.id, 'cotizada')}
                                        >
                                            Cotizada
                                        </button>

                                        <button
                                            className={`toggle-btn ${cita.efectivo ? 'active' : ''}`}
                                            onClick={() => handleToggleChange(cita.id, 'efectivo')}
                                        >
                                            Efectivo
                                        </button>

                                        <button
                                            className={`toggle-btn ${cita.bizum ? 'active' : ''}`}
                                            onClick={() => handleToggleChange(cita.id, 'bizum')}
                                        >
                                            Bizum
                                        </button>

                                        <button
                                            className={`toggle-btn ${cita.pagado ? 'active' : ''}`}
                                            onClick={() => handleToggleChange(cita.id, 'pagado')}
                                        >
                                            Pagado
                                        </button>
                                    </div>
                                    <Link to={`/api/citas/${cita.id}`}>
                                        <Boton texto="Ver Cita"/>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <Boton texto="Anterior" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                {pageNumbers.map(number => (
                    <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                        {number}
                    </button>
                ))}
                <Boton texto="Siguiente" onClick={() => paginate(currentPage + 1)} disabled={currentPage === pageNumbers.length} />
            </div>
        </div>
    );
};

export default ListCitas;
