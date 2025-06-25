const EditarFormacionModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  onChange,
  firstInputRef,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Editar Formación</h2>
        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="modal-content">
              <label className="modal-label mb-2">
                Título:
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Profesional:
                <input
                  type="text"
                  name="profesional"
                  value={formData.profesional}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Lugar:
                <input
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Temática:
                <input
                  type="text"
                  name="tematica"
                  value={formData.tematica}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Fecha de inicio:
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Fecha de finalización:
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
              <label className="modal-label mb-2 mt-2">
                Hora:
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={onChange}
                  className="modal-input mt-2"
                  required
                />
              </label>
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

export default EditarFormacionModal;
