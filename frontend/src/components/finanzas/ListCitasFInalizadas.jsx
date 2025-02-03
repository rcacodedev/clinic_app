import React, { useState, useEffect } from 'react';
import { marcarCitaCotizada, crearGananciaCita, fetchEstadosIngresos } from '../../services/finanzasService';
import Boton from '../Boton';

const CitasFinalizadas = ({ citas, userId, valorCita }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const citasPorPagina = 10;
    const [ingresos, setIngresos] = useState(0);
    const [ingresosCotizados, setIngresosCotizados] = useState(0);
    const [estadoCitas, setEstadoCitas] = useState({});

    // Recuperar el estado de ingresos desde localStorage
    useEffect(() => {
        const storedState = localStorage.getItem('estadoCitas');
        if (storedState) {
            setEstadoCitas(JSON.parse(storedState));
        }
    }, []);

    // Obtener estado de citas desde el backend cuando el usuario inicia sesión
    useEffect(() => {
        const obtenerEstadoCitas = async () => {
            try {
                // Aquí haces la llamada para obtener el estado actualizado de las citas
                const datos = await fetchEstadosIngresos();

                if (Array.isArray(datos.citas_ingresadas)) {
                    const estado = datos.citas_ingresadas.reduce((acc, cita) => {
                        acc[cita.cita_id] = cita.tipo;
                        return acc;
                    }, {});
                    setEstadoCitas(estado);
                }
            } catch (error) {
                console.error("Error al obtener el estado de las citas:", error);
            }
        };

        obtenerEstadoCitas();
    }, []);

    const citasDelUsuario = citas.filter(cita => cita.user_id === userId);
    const citasFinalizadas = citasDelUsuario.filter(cita => {
        const fechaCita = new Date(`${cita.fecha}T${cita.finalizar}`);
        return fechaCita <= new Date();
    });

    const citasOrdenadas = citasFinalizadas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.finalizar}`);
        const fechaB = new Date(`${b.fecha}T${b.finalizar}`);
        return fechaB - fechaA;
    });

    const indexOfLastCita = currentPage * citasPorPagina;
    const indexOfFirstCita = indexOfLastCita - citasPorPagina;
    const currentCitas = citasOrdenadas.slice(indexOfFirstCita, indexOfLastCita);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(citasOrdenadas.length / citasPorPagina); i++) {
        pageNumbers.push(i);
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const crearIngreso = async (citaId, tipo) => {
        // Verificar en el estado de citas si ya se hizo un ingreso
        if (estadoCitas[citaId]) return;

        try {
            const data = {
                monto: valorCita,
                descripcion: tipo === 'cotizado' ? 'Ingreso por cita cotizada' : 'Ingreso por cita',
            };
            const response = await crearGananciaCita(citaId, data);

            if (tipo === 'cotizado') {
                setIngresosCotizados(prev => prev + valorCita);
            } else {
                setIngresos(prev => prev + valorCita);
            }

            // Actualizamos el estado de las citas, guardando cada cita por separado
            setEstadoCitas(prev => {
                return { ...prev, [citaId]: tipo };
            });
        } catch (error) {
            if (error.response && error.response.data.detail === "La cita ya tiene una transacción registrada.") {
                alert("Esta cita ya tiene una transacción registrada.");
            } else {
                console.error("Error al crear el ingreso para la cita:", error);
            }
        }
    };

    const handleCotizar = async (citaId) => {
        // Si ya se hizo un ingreso, no permite hacer otro
        if (estadoCitas[citaId]) return;

        try {
            const response = await marcarCitaCotizada(citaId);
            await crearIngreso(citaId, 'cotizado');
        } catch (error) {
            console.error("Error al marcar la cita como cotizada:", error);
        }
    };

    const handleIngreso = async (citaId) => {
        // Si ya se hizo un ingreso, no permite hacer otro
        if (estadoCitas[citaId]) return;

        try {
            await crearIngreso(citaId, 'normal');
        } catch (error) {
            console.error("Error al registrar el ingreso:", error);
        }
    };

    return (
        <div className="list-citas">
            <h2>Citas Programadas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Fecha</th>
                        <th>Comenzar</th>
                        <th>Finalizar</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCitas.length === 0 ? (
                        <tr>
                            <td colSpan="5">No hay citas disponibles para este usuario.</td>
                        </tr>
                    ) : (
                        currentCitas.map((cita) => (
                            <tr key={cita.id}>
                                <td>{cita.patient_name}</td>
                                <td>{cita.fecha}</td>
                                <td>{cita.comenzar}</td>
                                <td>{cita.finalizar}</td>
                                <td>
                                    <button
                                        onClick={() => handleIngreso(cita.id)}
                                        disabled={estadoCitas[cita.id]} // Deshabilitar si ya se hizo un ingreso
                                    >
                                        Ingreso
                                    </button>
                                    <button
                                        onClick={() => handleCotizar(cita.id)}
                                        disabled={estadoCitas[cita.id]} // Deshabilitar si ya se hizo un ingreso
                                    >
                                        Cotizar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="pagination">
                <Boton
                    texto="Anterior"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    tipo="primario"
                />
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={currentPage === number ? 'active' : ''}
                    >
                        {number}
                    </button>
                ))}
                <Boton
                    texto="Siguiente"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === pageNumbers.length}
                    tipo="primario"
                />
            </div>
        </div>
    );
};

export default CitasFinalizadas;
