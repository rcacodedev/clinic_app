import React from "react";
import { Link } from "react-router-dom";

const ActivityList = ({ activities }) => {
  return (
    <div className="mt-8">
      {activities.length === 0 ? (
        <p className="text-center text-gray-500">
          No hay actividades disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((actividad) => (
            <div
              key={actividad.id}
              className="rounded-xl bg-white shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold text-black-600 mb-2">
                {actividad.name}
              </h3>
              <p className="text-gray-700 mb-1">{actividad.description}</p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Hora:</strong> {actividad.start_time?.slice(0, 5)}
              </p>
              {actividad.monitor_detail ? (
                <p className="text-sm text-gray-600">
                  <strong>Monitor:</strong>{" "}
                  {actividad.monitor_detail.first_name}{" "}
                  {actividad.monitor_detail.last_name}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Sin monitor asignado</p>
              )}

              <Link
                to={`/actividades/${actividad.id}`}
                className="inline-block mt-4 text-sm text-tan hover:underline font-bold"
              >
                Ver detalles →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityList;
