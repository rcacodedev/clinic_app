import React, { useState, useEffect } from "react";
import citasService from "../../services/citasService";
import Boton from "../Boton";
import CustomModal from "../Modal";
import '../../styles/citas/crearCitasModal.css'

const EditarCitaModal = ({ showModal, onClose, cita, refreshCitas, patients }) => {
    const [formData, setFormData] = useState({
      patient_name_input: "",
      fecha: "",
      comenzar: "",
      finalizar: "",
      descripcion: "",
    });

    const [isDeleted, setIsDeleted] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para manejar la búsqueda
    const [filteredPatients, setFilteredPatients] = useState([]); // Estado para almacenar pacientes filtrados

    useEffect(() => {
      if (cita) {
        setFormData({
          patient_name_input: `${cita.patient_name || ""} ${cita.patient_primer_apellido || ""} ${cita.patient_segundo_apellido || ""}`.trim(),
          fecha: cita.fecha,
          comenzar: cita.comenzar,
          finalizar: cita.finalizar,
          descripcion: cita.descripcion,
        });
        setIsDeleted(false);
      }
    }, [cita]);

    useEffect(() => {
      if (searchTerm) {
        // Filtrar pacientes según la búsqueda
        setFilteredPatients(
          patients.filter(patient =>
            `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          ));

      } else {
        setFilteredPatients([]);
      }
    }, [searchTerm, patients]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isDeleted) {
        console.error("La cita ha sido eliminada, no puedes editarla.");
        return;
      }

      try {
        await citasService.updateCita(cita.id, formData);
        onClose();
        refreshCitas();
      } catch (error) {
        console.error("Error al editar la cita", error);
      }
    };

    const handleDelete = async () => {
      try {
        await citasService.deleteCita(cita.id);
        setIsDeleted(true);
        refreshCitas();
        onClose(); // Cierra el modal después de eliminar
        alert("La cita ha sido eliminada con exito")
      } catch (error) {
        console.error("Error al eliminar la cita", error);
      }
    };

    const handlePatientSelect = (patient) => {
      setFormData({
        ...formData,
        patient_name_input: `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`,
      });
      setSearchTerm(""); // Limpiar el campo de búsqueda después de seleccionar un paciente
      setFilteredPatients([]);
    };

    const handlePatientInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setFormData((prevState) => ({
        ...prevState,
        patient_name_input: value,
      }));

      if (value.trim()) {
        const filtered = patients.filter(patient =>
          `${patient.nombre} ${patient.primer_apellido} ${patient.segundo_apellido}`
            .toLowerCase()
            .includes(value.toLowerCase())
        );
        setFilteredPatients(filtered);
      } else {
        setFilteredPatients([]);
      }
    }

    return (
      <CustomModal
        isOpen={showModal}
        onRequestClose={onClose}
        title="Editar o Eliminar Cita"
        closeButtonText="Cerrar"
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="patient_name_input"
            value={formData.patient_name_input}
            onChange={handlePatientInputChange} // Actualiza el término de búsqueda
            placeholder="Nombre del paciente"
            required
          />
          {/* Mostrar la lista de sugerencias de pacientes */}
          {searchTerm && filteredPatients.length > 0 && (
            <ul className="suggested-patients-list">
              {filteredPatients.map(patient => (
                <li
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="suggested-patient"
                >
                  {patient.nombre} {patient.primer_apellido}
                </li>
              ))}
            </ul>
          )}
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
          <Boton texto="Guardar Cambios" tipo="guardar" />
          <Boton texto="Eliminar" tipo="eliminar" onClick={handleDelete} />
        </form>
      </CustomModal>
    );
};

export default EditarCitaModal;
