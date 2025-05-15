import React, { useState, useEffect } from "react";
import CustomModal from "../Modal";
import Boton from "../Boton";
import { getToken, decodeJWT } from "../../utils/auth";
import { fetchWorkers } from "../../services/workerService";
import  "../../styles/actividades/crearActividadModal.css"

const CrearActividadModal = ({ isOpen, onClose, onCreate, currentUserId }) => {
    const [activityData, setActivityData] = useState({
        name: '',
        description: '',
        user: currentUserId, // ID del usuario actual
        start_date:'',
        monitor: '', // El campo monitor
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
                  name: decodedUser.first_name && decodedUser.last_name ? `${decodedUser.first_name} ${decodedUser.last_name}` : "Usuario Desconocido",
              };

              // Ahora hacemos la llamada a la API para obtener los trabajadores
              const response = await fetchWorkers();  // Suponiendo que fetchWorkers es la función para obtener la lista de trabajadores

              // Si la respuesta no tiene resultados, terminamos
              if (!response.results || response.results.length === 0) {
                  console.error('No se encontraron trabajadores');
                  return;
              }

              // Formateamos la lista de trabajadores
              const formattedWorkers = response.results.map(worker => ({
                  id: worker.user.id,
                  name: `${worker.user.first_name} ${worker.user.last_name}`,
              }));

              // Agregamos el usuario actual (el que creó la actividad) a la lista de monitores
              const allMonitors = [currentUser, ...formattedWorkers];

              // Actualizamos el estado con los monitores formateados
              setWorkersOptions(allMonitors);  // Asegúrate de tener el estado correctamente configurado

          } catch (error) {
              console.error('Error al cargar monitores:', error);
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
        return (
            activityData.name &&
            activityData.description
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid()) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Asegurarse de que la fecha esté en formato correcto (ISO 8601: YYYY-MM-DD)
        const formattedStartDate = new Date(activityData.start_date).toISOString().split('T')[0];

        try {
            const dataToSend = {
                ...activityData,
                start_date: formattedStartDate,  // Enviar la fecha en formato ISO
            };
            await onCreate(dataToSend);
            onClose();
        } catch (error) {
            console.error('Error al crear actividad:', error);
            alert('Hubo un error al crear la actividad. Por favor, inténtalo nuevamente.');
        }
      };

    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onClose}
            title="Crear Nueva Actividad"
            closeButtonText="Cancelar"
        >
            <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="name"
                        value={activityData.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Descripción:
                    <textarea
                        name="description"
                        value={activityData.description}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Fecha de Inicio
                    <input
                        type="date"
                        name="start_date"
                        value={activityData.start_date}
                        onChange={handleChange}
                        />
                </label>
                <label>
                    Monitor:
                    <select
                        name="monitor"
                        value={activityData.monitor}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccionar monitor</option>
                        {workersOptions.map(worker => (
                            <option key={worker.id} value={worker.id}>
                                {worker.name}
                            </option>
                        ))}
                    </select>
                </label>
                <Boton texto="Crear" onClick={handleSubmit} tipo="guardar" />
            </form>
        </CustomModal>
    );
};

export default CrearActividadModal;
