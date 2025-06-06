import React from "react";

const EditarActividadModal = ({
  formData,
  setFormData,
  workersOptions,
  onClose,
  onSave,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDia = (dia) => {
    setFormData((prev) => {
      const isSelected = prev.recurrence_days.includes(dia);
      return {
        ...prev,
        recurrence_days: isSelected
          ? prev.recurrence_days.filter((d) => d !== dia)
          : [...prev.recurrence_days, dia],
      };
    });
  };

  return (
    <div className="modal-container">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <h2 className="text-lg font-bold mb-4">Editar Actividad</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="modal-label">
              Nombre
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre"
              className="modal-input"
            />
          </div>
          <div>
            <label htmlFor="description" className="modal-label">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción"
              className="notas-textarea"
            />
          </div>
          <div>
            <label htmlFor="name" className="modal-label">
              Monitor
            </label>
            <select
              name="monitor_id"
              value={formData.monitor_id}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
            >
              <option value="">Seleccionar monitor</option>
              {workersOptions.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="start_time" className="modal-label">
              Comienzo
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time?.slice(0, 5) || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-tan focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="description" className="modal-label">
              Finalización
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time?.slice(0, 5) || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-tan focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="description" className="modal-label">
              Días de la semana
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
                "Domingo",
              ].map((dia) => (
                <button
                  key={dia}
                  type="button"
                  className={`px-3 py-1 rounded ${
                    formData.recurrence_days.includes(dia)
                      ? "bg-tan text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => toggleDia(dia)}
                >
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="modal-label">
              Precio (Euros/mes)
            </label>
            <input
              type="number"
              name="precio"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-close-modal">
            Cancelar
          </button>
          <button onClick={onSave} className="btn-save-modal">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarActividadModal;
