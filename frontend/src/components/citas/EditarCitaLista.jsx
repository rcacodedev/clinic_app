import { useEffect, useState } from "react";
import Select from "react-select";
import { getPacientes } from "../../services/patientService";
import ConfirmModal from "../ConfirmModal";

const opcionesPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "bizum", label: "Bizum" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
];

const EditarCitaLista = ({
  isOpen,
  onClose,
  onSave,
  formData,
  onChange,
  firstInputRef,
  setFormData,
  onDelete,
}) => {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMetodoPago, setSelectedMetodoPago] = useState(null);

  /* Seleccionar paciente lista */
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getPacientes();
        const opciones = (data.results || []).map((paciente) => ({
          value: paciente.id,
          label: `${paciente.nombre} ${paciente.primer_apellido} ${paciente.segundo_apellido}`,
        }));
        setPacientes(opciones);

        if (formData.paciente_id) {
          const seleccionado = opciones.find(
            (p) => p.value === formData.paciente_id
          );
          setSelectedPaciente(seleccionado || null);
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };

    fetchPacientes();
  }, [formData.paciente_id]);

  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
    setFormData((prev) => ({
      ...prev,
      paciente_id: selectedOption ? selectedOption.value : "",
    }));
  };

  /* Manejo de metodo de pago */
  useEffect(() => {
    if (formData.metodo_pago) {
      const metodo = opcionesPago.find((m) => m.value === formData.metodo_pago);
      setSelectedMetodoPago(metodo || null);
    }
  }, [formData.metodo_pago]);

  const handleMetodoPagoChange = (selectedOption) => {
    setSelectedMetodoPago(selectedOption);
    setFormData((prev) => ({
      ...prev,
      metodo_pago: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    onDelete(formData);
    setShowConfirmModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Editar Formación</h2>
        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="modal-content">
              <label className="modal-label mb-2">Seleccionar Paciente</label>
              <Select
                options={pacientes}
                value={selectedPaciente}
                onChange={handlePacienteChange}
                placeholder="Buscar paciente..."
                isClearable
                ref={firstInputRef}
              />

              <label className="modal-label mb-2 mt-2">
                Descripción:
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Fecha:
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Hora de Inicio:
                <input
                  type="time"
                  name="comenzar"
                  value={formData.comenzar}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Hora de Finalizar:
                <input
                  type="time"
                  name="finalizar"
                  value={formData.finalizar}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Precio:
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Método de pago:
                <Select
                  options={opcionesPago}
                  value={selectedMetodoPago}
                  onChange={handleMetodoPagoChange}
                  placeholder="Seleccionar método de pago..."
                  isClearable
                  className="mt-2"
                />
              </label>

              <div className="btn-close-container flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-close-modal"
                >
                  Cerrar
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="btn-delete-modal bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Eliminar
                  </button>

                  <button type="submit" className="btn-save-modal">
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar esta cita?"
      />
    </div>
  );
};

export default EditarCitaLista;
