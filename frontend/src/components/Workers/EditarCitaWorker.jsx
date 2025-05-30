import React, { useState, useEffect } from "react";
import { updateWorkerAppointment, deleteWorkerAppointment } from "../../services/workerService";
import Boton from "../Boton";
import CustomModal from "../Modal";
import Notification from "../Notification";

const EditarCitaModal = ({ showModal, onClose, cita, refreshCitas, workerId }) => {
  const [formData, setFormData] = useState({
    patient_name_input: "",
    fecha: "",
    comenzar: "",
    finalizar: "",
    descripcion: "",
  });

  const [isDeleted, setIsDeleted] = useState(false);
  const [isNotificationVisibleEditar, setIsNotificationVisibleEditar] = useState(false);

  // Cargar los datos de la cita cuando cambia la cita seleccionada
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

  // Maneja los cambios de los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Maneja el envío del formulario para editar la cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDeleted) {
      console.error("La cita ha sido eliminada, no puedes editarla.");
      return;
    }

    try {
      // Asumimos que el workerId es parte de la cita seleccionada
      await updateWorkerAppointment(workerId, cita.id, formData);  // Aquí añadimos workerId y appointmentId
      onClose();
      refreshCitas();
      setIsNotificationVisibleEditar(true)
    } catch (error) {
      console.error("Error al editar la cita", error);
    }
  };

  // Maneja la eliminación de la cita
  const handleDelete = async () => {
    try {
      // También pasamos el workerId junto al appointmentId
      await deleteWorkerAppointment(workerId, cita.id);  // Aquí añadimos workerId y appointmentId
      setIsDeleted(true);
      refreshCitas();
      onClose(); // Cierra el modal después de eliminar
      alert("La cita ha sido eliminada con éxito");
    } catch (error) {
      console.error("Error al eliminar la cita", error);
    }
  };

  return (
    <div>
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
            onChange={handleChange}
            placeholder="Nombre del paciente"
            required
          />
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
      <Notification
        message="Cita editada correctamente"
        isVisible={isNotificationVisibleEditar}
        onClose={() => setIsNotificationVisibleEditar(false)}
        />
    </div>

  );
};

export default EditarCitaModal;
