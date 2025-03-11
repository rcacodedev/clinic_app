import React, { useEffect, useState } from 'react';
import { getUserIdFromToken } from '../../utils/auth';
import CrearActividadModal from '../../components/actividades/CrearActividadModal';
import ActivityList from '../../components/actividades/ActivityList';
import Boton from '../../components/Boton';
import { createActivity, getActivities } from '../../services/activityService'; // Asegúrate de tener la función getActivities
import '../../styles/actividades/actividadesPage.css';

const Activity = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [activities, setActivities] = useState([]); // Estado para almacenar las actividades

    useEffect(() => {
        const token = localStorage.getItem('access');
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
                console.error('Error al obtener actividades:', error);
            }
        };

        fetchActivities();
    }, []);  // Esto se ejecutará una sola vez cuando se monte el componente

    // Función para actualizar la lista de actividades
    const updateActivities = (newActivity) => {
        setActivities((prevActivities) => [...prevActivities, newActivity]);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleCreateActivity = async (activityData) => {
        console.log('Datos de la actividad a crear:', activityData);
        try {
            const newActivity = await createActivity(activityData);
            alert('¡Actividad creada correctamente!');
            updateActivities(newActivity);  // Actualiza la lista
            setIsModalOpen(false);         // Cierra el modal
        } catch (error) {
            console.error('Error al crear la actividad:', error.response ? error.response.data : error);
            alert('Hubo un error al crear la actividad.');
        }
    };

    return (
        <>
            <div className="activity-container">
                <h1>Gestión de Actividades</h1>
                <Boton texto="Añadir Actividad" onClick={toggleModal}  className="boton-actividad" />

                {currentUserId && (
                    <CrearActividadModal
                        isOpen={isModalOpen}
                        onClose={toggleModal}
                        onCreate={handleCreateActivity}
                        currentUserId={currentUserId}
                    />
                )}

                <div>
                    <h1>Lista de Actividades</h1>
                    <ActivityList activities={activities} />
                </div>
            </div>
        </>
    );
};

export default Activity;
