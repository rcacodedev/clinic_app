import React, { useEffect, useState } from "react";
import { getUserIdFromToken } from "../../utils/auth";
import CrearActividadModal from "../../components/actividades/CrearActividadModal";
import ActivityList from "../../components/actividades/ActivityList";
import { createActivity, getActivities } from "../../services/activityService"; // Asegúrate de tener la función getActivities
import { toast } from "react-toastify";

const Activity = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activities, setActivities] = useState([]); // Estado para almacenar las actividades

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      const userId = getUserIdFromToken(token);
      setCurrentUserId(userId);
    }
  }, []);

  // Cargar las actividades al montar el componente
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getActivities();
        // Verifica si la propiedad 'activities' existe y es un arreglo
        if (data && Array.isArray(data.results)) {
          setActivities(data.results);
        } else {
          console.error('La propiedad "activities" no es un arreglo:', data);
        }
      } catch (error) {
        console.error("Error al obtener actividades:", error);
        toast.error("Error al cargar las actividades");
      }
    };

    fetchActivities();
  }, []); // Esto se ejecutará una sola vez cuando se monte el componente

  // Función para actualizar la lista de actividades
  const updateActivities = (newActivity) => {
    setActivities((prevActivities) => [...prevActivities, newActivity]);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCreateActivity = async (activityData) => {
    try {
      const newActivity = await createActivity(activityData);
      updateActivities(newActivity); // Actualiza la lista
      setIsModalOpen(false); // Cierra el modal
      toast.success("Actividad creada con éxito");
    } catch (error) {
      console.error(
        "Error al crear la actividad:",
        error.response ? error.response.data : error
      );
      toast.error("Error al crear la actividad");
    }
  };

  return (
    <>
      <div className="main-container">
        <div className="title-container">
          <h1 className="title">Actividades</h1>
          <p className="title-description">
            Creación y listado de pacientes actividades.
          </p>
        </div>
        <div className="search-container">
          {/* Botón para añadir paciente */}
          <button className="btn-primary" onClick={toggleModal}>
            Añadir Actividad
          </button>
        </div>

        {currentUserId && (
          <CrearActividadModal
            isOpen={isModalOpen}
            onClose={toggleModal}
            onCreate={handleCreateActivity}
            currentUserId={currentUserId}
          />
        )}

        <div>
          <ActivityList activities={activities} />
        </div>
      </div>
    </>
  );
};

export default Activity;
