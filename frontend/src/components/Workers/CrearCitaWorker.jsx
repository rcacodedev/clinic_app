import React, { useState, useEffect } from 'react';
import { assignAppointmentToWorker } from '../../services/workerService';
import patientService from '../../services/patientService'; // Servicio de pacientes
import Boton from '../Boton';
import CrearCitaWorkerModal from './CrearCitaWorkerModal'; // Importamos el nuevo modal
import Notification from '../Notification'

const CrearCita = ({ refreshCitas, workerId }) => {
    const [newCita, setNewCita] = useState({
        patient_name_input: '',
        fecha: '',
        comenzar: '',
        finalizar: '',
        descripcion: '',
        worker: workerId,
    }); // Nueva cita o datos a editar
    const [loading, setLoading] = useState(false); // Indicador de carga para pacientes
    const [patients, setPatients] = useState([]); // Lista de pacientes sugeridos
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal
    const [notificationCrearCita, setNotificationCrearCita] = useState(false);

    // Manejar cambios en los inputs del formulario
    const handleChange = async (e) => {
        const { name, value } = e.target;

        setNewCita((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'patient_name_input' && value.length >= 1) {
            setLoading(true);
            try {
                const patientsData = await patientService.getPatients({ searchTerm: value });
                if (patientsData.results) {
                    setPatients(patientsData.results);
                }
            } catch (error) {
                console.error('Error al buscar pacientes:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setPatients([]);
        }
    };

    // Crear cita
    const handleSaveCita = async (newCita) => {
        try {
            const createdCita = await assignAppointmentToWorker(workerId, newCita);
            refreshCitas();  // Refresca la lista de citas
            setNewCita({ patient_name_input: '', fecha: '', comenzar: '', finalizar: '', descripcion: '', worker: workerId }); // Resetea el estado del formulario
            setShowModal(false); // Cierra el modal después de guardar
            setNotificationCrearCita(true);
        } catch (error) {
            setError(error.response ? error.response.data : error.message);
            console.error('Error al crear la cita:', error);
        }
    };

    // Abrir el modal
    const handleShowModal = () => {
        setShowModal(true); // Muestra el modal
        setNewCita({ patient_name_input: '', fecha: '', comenzar: '', finalizar: '', descripcion: '', worker: workerId }); // Resetea el estado del formulario
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
        setNewCita({ patient_name_input: '', fecha: '', comenzar: '', finalizar: '', descripcion: '', worker: workerId }); // Resetea el estado del formulario
    };

    return (
        <div className="crear-cita-container">
            <Boton texto="Añadir Cita" onClick={handleShowModal} tipo="primario" />

            {/* Modal de creación */}
            {showModal && (
                <CrearCitaWorkerModal
                    showModal={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSaveCita}
                    cita={newCita}
                    handleChange={handleChange}
                    patients={patients}
                    loading={loading}
                    error={error}
                    onPatientSelect={(patient) => setNewCita({ ...newCita, patient_name_input: `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}` })}
                />
            )}
            <Notification
                message="Cita creada correctamente."
                isVisible={notificationCrearCita}
                onClose={() => setNotificationCrearCita(false)}
                />
        </div>
    );
};

export default CrearCita;
