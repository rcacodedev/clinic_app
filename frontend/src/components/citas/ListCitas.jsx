import React, { useState, useEffect } from 'react';
import Boton from '../Boton';
import { Link } from 'react-router-dom';
import '../../styles/citas/listCitas.css';

const ListCitas = ({ citas, userId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const citasPorPagina = 15;

    // Filtrar las citas solo para el usuario actual
    const citasDelUsuario = citas.filter(cita => {
        return cita.user_id === userId;
    });

    // Filtrar las citas que ya han finalizado
    const citasFinalizadas = citasDelUsuario.filter(cita => {
        const fechaCita = new Date(`${cita.fecha}T${cita.finalizar}`);
        return fechaCita <= new Date(); // Solo las citas que han terminado
    });

    // Ordenar las citas finalizadas en orden descendente (la más reciente primero)
    const citasOrdenadas = citasFinalizadas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.finalizar}`);
        const fechaB = new Date(`${b.fecha}T${b.finalizar}`);
        return fechaB - fechaA; // Orden descendente
    });

    // Paginación
    const indexOfLastCita = currentPage * citasPorPagina;
    const indexOfFirstCita = indexOfLastCita - citasPorPagina;
    const currentCitas = citasOrdenadas.slice(indexOfFirstCita, indexOfLastCita);

    // Número de páginas
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(citasOrdenadas.length / citasPorPagina); i++) {
        pageNumbers.push(i);
    }

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);



    return (
        <div className="list-citas">
            <h2>Citas Finalizadas</h2>
            <table className='list-citas-table'>
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
                                <td>{cita.patient_name} {cita.patient_primer_apellido}</td>
                                <td>{cita.fecha}</td>
                                <td>{cita.comenzar}</td>
                                <td>{cita.finalizar}</td>
                                <td>
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
                <Boton
                    texto="Anterior"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
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
                />
            </div>
        </div>
    );
};

export default ListCitas;
