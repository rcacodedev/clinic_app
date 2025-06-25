// components/EditarUserModal.jsx
import React from "react";

const EditarUserModal = ({
  isOpen,
  onClose,
  userInfo,
  onSave,
  onChange,
  firstInputRef,
}) => {
  if (!isOpen) return null;

  const renderInput = (
    label,
    name,
    type = "text",
    required = false,
    tabIndex
  ) => (
    <div>
      <label htmlFor={name} className="modal-label">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={userInfo[name] || ""}
        onChange={onChange}
        placeholder={label}
        tabIndex={tabIndex}
        className="modal-input"
        required={required}
        autoComplete="off"
      />
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userInfo);
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Editar Usuario</h2>

        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="grid gap-y-4" noValidate>
              {/* Sección: Datos del Usuario */}
              <div className="w-full">
                <h6 className="modal-section-title">1. Datos del Usuario</h6>
                <p className="text-gray-600 text-sm mb-2 mt-2">
                  Introduce la información básica del usuario, como su nombre,
                  apellidos y datos de contacto.
                </p>
                <hr className="mb-4 mt-2" />
              </div>

              <div className="modal-content-pacientes">
                {/* Nombre con ref */}
                <div>
                  <label htmlFor="nombre" className="modal-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={userInfo.nombre || ""}
                    onChange={onChange}
                    placeholder="Nombre del usuario"
                    ref={firstInputRef}
                    tabIndex="1"
                    className="modal-input"
                    required
                    autoComplete="off"
                  />
                </div>

                {renderInput(
                  "Primer Apellido",
                  "primer_apellido",
                  "text",
                  true,
                  2
                )}
                {renderInput(
                  "Segundo Apellido",
                  "segundo_apellido",
                  "text",
                  false,
                  3
                )}
                {renderInput("Teléfono", "phone", "text", false, 4)}
                {renderInput(
                  "Fecha de Nacimiento",
                  "fecha_nacimiento",
                  "date",
                  false,
                  5
                )}
                {renderInput("DNI/NIF", "dni", "text", false, 6)}
                {renderInput("Dirección", "address", "text", false, 7)}
                {renderInput("Ciudad", "city", "text", false, 8)}
                {renderInput("Código Postal", "postal_code", "text", false, 9)}
                {renderInput("País", "country", "text", false, 10)}
              </div>

              {/* Sección: WhatsApp Business */}
              <div className="w-full">
                <h6 className="modal-section-title">
                  2. Integración con WhatsApp Business
                </h6>
                <p className="text-gray-600 text-sm mb-2 mt-2">
                  Información necesaria para el envío automático de citas a
                  través de WhatsApp.
                </p>
                <hr className="mb-4 mt-2" />
              </div>
              <div className="modal-content-pacientes">
                {renderInput(
                  "Número de WhatsApp Business",
                  "whatsapp_business_number",
                  "text",
                  false,
                  11
                )}
                {renderInput(
                  "Service SID de WhatsApp",
                  "twilio_whatsapp_service_sid",
                  "text",
                  false,
                  12
                )}
                {renderInput(
                  "Account SID de Twilio",
                  "twilio_account_sid",
                  "text",
                  false,
                  13
                )}
                {renderInput(
                  "Auth Token Twilio",
                  "twilio_auth_token",
                  "text",
                  false,
                  14
                )}
              </div>

              {/* Botones */}
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

export default EditarUserModal;
