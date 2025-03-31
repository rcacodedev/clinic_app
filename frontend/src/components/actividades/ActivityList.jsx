import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/actividades/listaActividades.css';

const ActivityList = ({ activities }) => { // Recibe activities como prop
    return (
        <div className="actividades-lista">
            {activities.length === 0 ? (
                <p>No hay actividades disponibles.</p>
            ) : (
                <div className="actividades-cards">
                    {activities.map((actividad) => (
                        <div className="actividad-card" key={actividad.id}>
                            <Link to={`/api/actividades/${actividad.id}`}>
                                <h3>{actividad.name}</h3>
                                <p>{actividad.description}</p>
                                <p>{actividad.start_date}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityList;
