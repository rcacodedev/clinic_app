import React, { useState, useEffect } from "react";
import citasService from "../../services/citasService";
import { getPacientes,  } from "../../services/patientService";
import Boton from "../Boton";
import CustomModal from "../Modal";


const initialFormState = {
  patient_name_input: "",
  fecha: "",
  comenzar: "",
  finalizar: "",
  descripcion: "",
};

const CreateCitaModal = ({ showModal, onClose, refreshCitas, showDateTimeFields, cita }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      setFormData({...initialFormState,
        fecha: cita?.fecha || "",
        comenzar: cita?.comenzar || "",
    }); // Reinicia el formulario cuando se abre el modal
      setPatients([]); // Limpia la lista de pacientes sugeridos
    }
  }, [showModal, cita]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "patient_name_input" && value.length >= 1) {
      setLoading(true);
      try {
        const patientsData = await getPacientes({
          searchTerm: value,
        });
        if (patientsData.results) {
          setPatients(patientsData.results);
        }
      } catch (error) {
        console.error("Error al buscar pacientes:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setPatients([]);
    }
  };

  const handlePatientSelect = (patient) => {
    const fullName = `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`;
    setFormData((prevState) => ({
      ...prevState,
      patient_name_input: fullName,
    }));
    setPatients([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await citasService.createCita(formData);
      onClose();
      refreshCitas();
    } catch (error) {
      console.error("Error al crear la cita", error);
    }
  };

  return (
    <CustomModal
      isOpen={showModal}
      onRequestClose={onClose}
      title="Crear Nueva Cita"
      closeButtonText="Cerrar"
    >
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            name="patient_name_input"
            value={formData.patient_name_input}
            onChange={handleChange}
            placeholder="Nombre del paciente"
            required
          />
          {patients.length > 0 && (
            <ul className="suggestions-list">
              {patients.map((patient) => (
                <li key={patient.id} onClick={() => handlePatientSelect(patient)}>
                  {`${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading && <p>Cargando pacientes...</p>}
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="comenzar"
          value={formData.comenzar}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="finalizar"
          value={formData.finalizar}
          onChange={handleChange}
          required
        />
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
        />
        <Boton texto="Guardar Cita" tipo="guardar" />
      </form>
    </CustomModal>
  );
};

export default CreateCitaModal;
