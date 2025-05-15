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
                          <h3 className='title-card'>{actividad.name}</h3>
                          <p className='description-card'>{actividad.description}</p>
                          <p className='hora-card'>Hora de comienzo: {actividad.start_time}</p>
                          {/* Ahora accedes correctamente al nombre del monitor */}
                          {actividad.monitor ? (
                            <p className='monitor-card'>Monitor: {actividad.monitor.first_name} {actividad.monitor.last_name}</p>
                          ) : (
                            <p>No asignado monitor</p>
                          )}
                        </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityList;
