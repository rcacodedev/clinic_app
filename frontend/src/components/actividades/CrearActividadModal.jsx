import React, { useState, useEffect } from "react";
import CustomModal from "../Modal";
import Boton from "../Boton";
import { getToken, decodeJWT } from "../../utils/auth";
import { fetchWorkers } from "../../services/workerService";

const CrearActividadModal = ({ isOpen, onClose, onCreate, currentUserId }) => {
  if (!isOpen) return null;
  const [activityData, setActivityData] = useState({
    name: "",
    description: "",
    user: currentUserId, // ID del usuario actual
    start_date: "",
    monitor: "", // El campo monitor
  });

  const [workersOptions, setWorkersOptions] = useState([]);

  useEffect(() => {
    const fetchWorkersOptions = async () => {
      try {
        // Llamamos a la función para obtener el token
        const token = getToken();
        if (!token) {
          console.error("Token no encontrado");
          return;
        }

        // Decodificamos el token para obtener los datos del usuario
        const decodedUser = decodeJWT(token);

        if (!decodedUser) {
          console.error("No se pudo decodificar el token");
          return;
        }

        // Extraemos el nombre y apellido del usuario desde el token decodificado
        // Aquí es donde verificas si los datos del nombre están disponibles
        const currentUser = {
          id: decodedUser.user_id,
          name:
            decodedUser.first_name && decodedUser.last_name
              ? `${decodedUser.first_name} ${decodedUser.last_name}`
              : "Usuario Desconocido",
        };

        // Ahora hacemos la llamada a la API para obtener los trabajadores
        const response = await fetchWorkers(); // Suponiendo que fetchWorkers es la función para obtener la lista de trabajadores

        // Si la respuesta no tiene resultados, terminamos
        if (!response.results || response.results.length === 0) {
          console.error("No se encontraron trabajadores");
          return;
        }

        // Formateamos la lista de trabajadores
        const formattedWorkers = response.results.map((worker) => ({
          id: worker.user.id,
          name: `${worker.user.first_name} ${worker.user.last_name}`,
        }));

        // Agregamos el usuario actual (el que creó la actividad) a la lista de monitores
        const allMonitors = [currentUser, ...formattedWorkers];

        // Actualizamos el estado con los monitores formateados
        setWorkersOptions(allMonitors); // Asegúrate de tener el estado correctamente configurado
      } catch (error) {
        console.error("Error al cargar monitores:", error);
      }
    };

    if (isOpen) {
      fetchWorkersOptions();
    }
  }, [isOpen, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivityData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isValid = () => {
    return activityData.name && activityData.description;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Asegurarse de que la fecha esté en formato correcto (ISO 8601: YYYY-MM-DD)
    const formattedStartDate = new Date(activityData.start_date)
      .toISOString()
      .split("T")[0];

    try {
      const dataToSend = {
        ...activityData,
        start_date: formattedStartDate, // Enviar la fecha en formato ISO
      };
      await onCreate(dataToSend);
      onClose();
    } catch (error) {
      console.error("Error al crear actividad:", error);
      alert(
        "Hubo un error al crear la actividad. Por favor, inténtalo nuevamente."
      );
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Crear Actividad</h2>
        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="grid gap-y-4" noValidate>
              <div className="w-full">
                <h6 className="modal-section-title">
                  1. Datos de la Actividad
                </h6>
                <p className="text-gray-600 text-sm mb-2 mt-2">
                  Introduce la información básica de la actividad.
                </p>
                <hr className=" mt-2" />
              </div>
              <div className="modal-content-pacientes"></div>
              <div>
                <label htmlFor="name" className="modal-label mb-2">
                  Nombre
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre de la Actividad"
                    className="modal-input mt-2"
                    value={activityData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label htmlFor="description" className="modal-label mb-2">
                  Descripción
                  <textarea
                    name="description"
                    value={activityData.description}
                    onChange={handleChange}
                    className="notas-textarea mt-2"
                    placeholder="Escribe una descripción sobre la actividad"
                    required
                  />
                </label>
                <label htmlFor="start_date" className="modal-label mb-2">
                  Fecha de Inicio
                  <input
                    type="date"
                    name="start_date"
                    value={activityData.start_date}
                    onChange={handleChange}
                    className="modal-input mt-2"
                  />
                </label>
                <label htmlFor="monitor" className="modal-label mb-2">
                  Monitor
                  <select
                    name="monitor"
                    value={activityData.monitor}
                    onChange={handleChange}
                    className="modal-input mt-2"
                    required
                  >
                    <option value="">Seleccionar monitor</option>
                    {workersOptions.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="btn-close-container">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-close-modal"
                  >
                    Cerrar
                  </button>
                  <button type="submit" className="btn-save-modal">
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearActividadModal;
