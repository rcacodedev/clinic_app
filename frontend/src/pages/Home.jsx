import React, { useEffect, useState } from "react";
import citasService from "../services/citasService";
import { Link } from 'react-router-dom';  // Importa Link para la navegación
import '../styles/home.css'

function Home() {
    const [citasHoy, setCitasHoy] = useState([]);
    const [citasTomorrow, setCitasTomorrow] = useState([]);

    useEffect(() => {
        const fetchCitasHoy = async () => {
            try {
                const citas = await citasService.getCitas(1, '', 'hoy');  // Filtrar citas de hoy
                setCitasHoy(citas);
            } catch (error) {
                console.error('Error al obtener las citas de hoy:', error);
            }
        };

        const fetchCitasTomorrow = async () => {
            try {
                const citas = await citasService.getCitas(1, "", 'mañana');
                setCitasTomorrow(citas);
            } catch (error) {
                console.error('Error al obtener las citas de mañana:', error);
            }
        }

        fetchCitasHoy();
        fetchCitasTomorrow();
    }, []);

    return (
        <div className="container-home">
            <h1>Bienvenida</h1>
            <div className="container-notas">
                <h1>Mis notas</h1>
                <h3>Muy Pronto!</h3>
            </div>
            <div className="agenda-container">
                {/* <Agenda /> */}
            </div>
            <div className="citas-filtradas">
                <p>Tus citas de hoy</p>
                <ul>
                    {citasHoy.length > 0 ? (
                        citasHoy.map((cita) => (
                            <li key={cita.id}>
                                {cita.patient.name} - {new Date(cita.fecha).toLocaleDateString()} {cita.finalizar}
                                {/* Agregar botón o enlace */}
                                <Link to={`/api/citas/${cita.id}`}>
                                    <button>Ver detalles</button>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <p>No tienes citas para hoy.</p>
                    )}
                </ul>
                <p>Tus citas de mañana</p>
                <ul>
                    {citasTomorrow.length > 0 ? (
                        citasTomorrow.map((cita) => (
                            <li key={cita.id}>
                                {cita.patient.name} - {new Date(cita.fecha).toLocaleDateString()} {cita.finalizar}
                                {/* Agregar botón o enlace */}
                                <Link to={`/api/citas/${cita.id}`}>
                                    <button>Ver detalles</button>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <p>No tienes citas para mañana.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Home;
