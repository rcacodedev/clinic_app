import React, { useState, useEffect } from 'react';
import CustomModal from '../Modal'; // Asegúrate de importar correctamente tu componente CustomModal
import Boton from '../Boton'; // Componente de botón


const CrearCitaWorkerModal = ({ showModal, onClose, onSave, cita, handleChange, patients, loading, error, onPatientSelect }) => {
    const [newCita, setNewCita] = useState(cita);

    useEffect(() => {
        setNewCita(cita);
    }, [cita]);

    const handlePatientSelect = (patient) => {
        onPatientSelect(patient);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(newCita);
    };

    return (
        <CustomModal
            isOpen={showModal}
            onRequestClose={onClose}
            title="Crear Cita"
            closeButtonText="Cerrar"
        >
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}

                {/* Selección de paciente */}
                <div className="input-container">
                    <label>Paciente</label>
                    <input
                        type="text"
                        name="patient_name_input"
                        value={newCita.patient_name_input}
                        onChange={handleChange}
                        placeholder="Buscar paciente"
                    />
                    {loading && <p>Cargando pacientes...</p>}
                    <div className="patient-suggestions">
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                className="patient-suggestion"
                                onClick={() => handlePatientSelect(patient)}
                            >
                                {patient.nombre} {patient.primer_apellido} {patient.segundo_apellido}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fecha de la cita */}
                <div className="input-container">
                    <label>Fecha</label>
                    <input
                        type="date"
                        name="fecha"
                        value={newCita.fecha}
                        onChange={handleChange}
                    />
                </div>

                {/* Hora de comienzo */}
                <div className="input-container">
                    <label>Comenzar</label>
                    <input
                        type="time"
                        name="comenzar"
                        value={newCita.comenzar}
                        onChange={handleChange}
                    />
                </div>

                {/* Hora de finalización */}
                <div className="input-container">
                    <label>Finalizar</label>
                    <input
                        type="time"
                        name="finalizar"
                        value={newCita.finalizar}
                        onChange={handleChange}
                    />
                </div>

                {/* Descripción */}
                <div className="input-container">
                    <label>Descripción</label>
                    <textarea
                        name="descripcion"
                        value={newCita.descripcion}
                        onChange={handleChange}
                        placeholder="Detalles de la cita"
                    />
                </div>

                <div className="modal-footer">
                    <Boton texto="Cancelar" onClick={onClose} tipo="secundario" />
                    <Boton texto="Guardar Cita" tipo="primario" />
                </div>
            </form>
        </CustomModal>
    );
};

export default CrearCitaWorkerModal;
