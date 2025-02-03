import React, { useState, useEffect } from "react";
import CustomModal from "../../components/Modal";
import { updateWorker } from "../../services/workerService";

const EditarEmpleadoModal = ({ isOpen, onRequestClose, worker, onWorkerUpdated }) => {
  const [formData, setFormData] = useState({
    address: "",
    postal_code: "",
    phone: "",
    country: "",
    branch: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincroniza el estado cuando cambia el trabajador
  useEffect(() => {
    if (worker) {
      setFormData({
        address: worker.address || "",
        postal_code: worker.postal_code || "",
        phone: worker.phone || "",
        country: worker.country || "",
        branch: worker.branch || "",
      });
    }
  }, [worker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Llamada al servicio para actualizar el trabajador
      const updatedWorker = await updateWorker(worker.id, formData);
      onWorkerUpdated(updatedWorker); // Notifica al componente padre
      onRequestClose(); // Cierra el modal
    } catch (err) {
      setError("Error al actualizar los datos del trabajador.");
      console.error("Error al actualizar el trabajador:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!worker) return null; // Evita renderizar si los datos no están listos

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title="Editar Empleado"
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="phone">Teléfono:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Dirección:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="postal_code">Código Postal:</label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">País:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="branch">Sección:</label>
          <input
            type="text"
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </CustomModal>
  );
};

export default EditarEmpleadoModal;
