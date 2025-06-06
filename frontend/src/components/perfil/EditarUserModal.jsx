// components/EditarUserModal.jsx
import React, { useState, useEffect } from "react";

const EditarUserModal = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState(userData || {});

  useEffect(() => {
    if (userData) {
      setFormData(userData); // ← CORRECTO
    }
  }, [userData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // opcional: guardar en backend
    onClose(); // cierra el modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-3xl shadow-lg overflow-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            "nombre",
            "primer_apellido",
            "segundo_apellido",
            "fecha_nacimiento",
            "dni",
            "phone",
            "address",
            "postal_code",
            "city",
            "country",
            "whatsapp_business_number",
            "twilio_whatsapp_service_sid",
            "twilio_account_sid",
            "twilio_auth_token",
          ].map((field) => (
            <div className="flex flex-col" key={field}>
              <label className="text-sm text-gray-600 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              <input
                type={field === "fecha_nacimiento" ? "date" : "text"}
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}

          {/* Campo para el booleano de verificación */}
          <div className="flex flex-col col-span-2">
            <label className="text-sm text-gray-600">
              ¿Integración Verificada?
            </label>
            <select
              name="twilio_integration_verified"
              value={formData.twilio_integration_verified ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  twilio_integration_verified: e.target.value === "true",
                }))
              }
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end mt-6 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarUserModal;
