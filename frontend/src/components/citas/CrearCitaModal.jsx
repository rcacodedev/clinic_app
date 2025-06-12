import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getPacientes } from "../../services/patientService"; // Ajusta según tu estructura

const CrearCitaModal = ({
  onClose,
  onSubmit,
  formData,
  setFormData,
  onChange,
  firstInputRef,
}) => {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getPacientes();
        const opciones = (data.results || []).map((paciente) => ({
          value: paciente.id,
          label:
            paciente.nombre +
            " " +
            paciente.primer_apellido +
            " " +
            paciente.segundo_apellido,
        }));
        setPacientes(opciones);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };

    fetchPacientes();
  }, []);

  // Actualiza el paciente seleccionado en formData
  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
    setFormData((prev) => ({
      ...prev,
      paciente_id: selectedOption ? selectedOption.value : "",
    }));
  };

  // Maneja cambios en inputs de fecha, hora, descripción
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  console.log(pacientes);

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Crear Nueva Cita</h2>

        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={onSubmit} className="modal-content">
              <label className="modal-label mb-2">Seleccionar Paciente</label>
              <Select
                options={pacientes}
                value={selectedPaciente}
                onChange={handlePacienteChange}
                placeholder="Buscar paciente..."
                isClearable
                ref={firstInputRef}
              />

              <label className="modal-label mb-2 mt-2">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="modal-input"
                required
              />

              <label className="modal-label mb-2 mt-2">Hora inicio</label>
              <input
                type="time"
                name="comenzar"
                value={formData.comenzar}
                onChange={handleInputChange}
                className="modal-input"
                required
              />

              <label className="modal-label mb-2 mt-2">Hora fin</label>
              <input
                type="time"
                name="finalizar"
                value={formData.finalizar}
                onChange={handleInputChange}
                required
                className="modal-input"
              />

              <label className="modal-label mt-2 mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Descripción de la cita"
                className="notas-textarea"
              />

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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearCitaModal;
