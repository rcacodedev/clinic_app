import React, { useState, useEffect } from 'react';
import citasService from '../services/citasService';
import patientService from '../services/patientService'; // Servicio de pacientes
import { getToken, getUserIdFromToken } from '../utils/auth';
import Boton from '../components/Boton';
import Agenda from '../components/Agenda';
import ListCitas from '../components/ListCitas';
import CrearCitaModal from '../components/citas/CrearCitaModal'; // Importamos el nuevo modal
import EditarCitaModal from '../components/citas/EditarCitaModal'; // Importamos el EditarCitaModal
import '../styles/citas.css'

const initialCitaState = {
    patient_name_input: '',
    fecha: '',
    comenzar: '',
    finalizar: '',
    descripcion: '',
};

const CitasPage = () => {
    const [citas, setCitas] = useState([]); // Lista de citas
    const [loading, setLoading] = useState(false); // Indicador de carga para pacientes
    const [showModal, setShowModal] = useState(false); // Mostrar/ocultar modal
    const [selectedCita, setSelectedCita] = useState(null); // Cita seleccionada para editar
    const [newCita, setNewCita] = useState(initialCitaState); // Nueva cita o datos a editar
    const [currentWeek, setCurrentWeek] = useState([]); // Semana actual
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]); // Lista de pacientes sugeridos
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [citaToDelete, setCitaToDelete] = useState(null);


    const token = getToken();
    const userId = getUserIdFromToken(token);

    useEffect(() => {
        if (userId) {
            loadCitas();
        }
        initializeWeek();
    }, []);

    // Inicializar la semana actual
    const initializeWeek = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Ajusta al lunes
        startOfWeek.setDate(today.getDate() + diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const week = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });

        setCurrentWeek(week);
    };

    // Cambiar de semana
    const changeWeek = (direction) => {
        setCurrentWeek((prevWeek) =>
            prevWeek.map((day) => new Date(day.getTime() + direction * 7 * 24 * 60 * 60 * 1000))
        );
    };

    // Cargar citas desde el servicio
    const loadCitas = async () => {
        try {
            const data = await citasService.getCitas();
            setCitas(data);
        } catch (error) {
            console.error('Error al cargar las citas:', error);
        }
    };

    const refreshCitas = () => {
        loadCitas(); // Esta función puede llamarse en el modal para actualizar las citas.
    };

    // Manejar cambios en los inputs del formulario (pasado al modal)
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

    // Crear o editar cita
    const handleSaveCita = async (e) => {
        e.preventDefault();
        try {
            let updatedCita;
            if (selectedCita) {
                updatedCita = await citasService.updateCita(selectedCita.id, newCita);
                setCitas((prev) => prev.map((cita) => (cita.id === updatedCita.id ? updatedCita : cita)));
            } else {
                updatedCita = await citasService.createCita(newCita);
                setCitas((prev) => [...prev, updatedCita]);  // Aquí agregas la cita al estado directamente
            }
            handleCloseModal();
        } catch (error) {
            setError(error.response ? error.response.data : error.message);
            console.error('Error al guardar la cita:', error);
        }
    };

    // Eliminar cita
    const handleDeleteCita = async (id) => {
        setCitaToDelete(id);
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        try {
            await citasService.deleteCita(citaToDelete);
            setCitas((prev) => prev.filter((cita) => cita.id !== citaToDelete));
            setShowConfirmDelete(false); // Cierra el cuadro de confirmación
            handleCloseModal();
        } catch (error) {
            console.error('Error al eliminar la cita:', error);
            setShowConfirmDelete(false); // Cierra el cuadro de confirmación en caso de error
        }
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
    };


    // Abrir el modal
    const handleShowModal = (cita = null) => {
        if (cita) {
            setNewCita({
                ...cita,
                patient_name_input: `${cita.patient_name || ''} ${cita.patient_primer_apellido || ''} ${cita.patient_segundo_apellido || ''}`.trim(),
            });
        } else {
            setNewCita(initialCitaState);
            setSelectedCita(null);  // Asegurarse de limpiar selectedCita al crear una nueva
        }
        setShowModal(true);
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setNewCita(initialCitaState);
        setPatients([]);
    };

    return (
        <div className='citas-container'>
            <div className="citas-container">
                <div className="citas-boton-container">
                    <Boton texto="Añadir Cita" onClick={() => handleShowModal()} tipo="primario" />
                </div>

                {/* Modal de creación o edición */}
                {showModal && (
                    selectedCita ? (
                        <EditarCitaModal
                            showModal={showModal}
                            onClose={handleCloseModal}
                            onSave={handleSaveCita}
                            onDelete={handleDeleteCita}
                            onConfirmDelete={confirmDelete}
                            onCancelDelete={cancelDelete}
                            showConfirmDelete={showConfirmDelete}
                            cita={newCita}
                            handleChange={handleChange}
                            patients={patients}
                            onPatientSelect={(patient) =>
                                setNewCita({
                                    ...newCita,
                                    patient_name_input: `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`,
                                })
                            }
                            loading={loading}
                            error={error}
                            selectedCita={selectedCita}
                            refreshCitas={refreshCitas}
                        />
                    ) : (
                        <CrearCitaModal
                            showModal={showModal}
                            onClose={handleCloseModal}
                            onSave={handleSaveCita}
                            cita={newCita}
                            handleChange={handleChange}
                            patients={patients}
                            onPatientSelect={(patient) =>
                                setNewCita({
                                    ...newCita,
                                    patient_name_input: `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`,
                                })
                            }
                            loading={loading}
                            error={error}
                            refreshCitas={refreshCitas}
                        />
                    )
                )}


                <div className="container-agenda">
                    <Agenda
                        citas={citas}
                        currentWeek={currentWeek}
                        setCurrentWeek={setCurrentWeek}
                        changeWeek={changeWeek}
                        openModal={handleShowModal}
                        setSelectedCita={setSelectedCita}
                    />
                </div>

                <div className="container-listCitas">
                    <ListCitas
                        citas={citas}
                        handleEdit={handleShowModal}
                        handleDelete={handleDeleteCita}
                        userId={userId}
                    />
                </div>
            </div>
        </div>

    );
};

export default CitasPage;