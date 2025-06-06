import React, { useState } from "react";

const CrearPacienteModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  firstInputRef,
  setFormData,
  handleAddPathology,
  handleRemovePathology,
}) => {
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleCheckboxChange = () => {
    setFormData({ ...formData, alergias: !formData.alergias });
  };

  const handleNotasChange = (e) => {
    setFormData({ ...formData, notas: e.target.value });
  };

  const handleFileChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files[0] });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre?.trim())
      newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.primer_apellido?.trim())
      newErrors.primer_apellido = "El primer apellido es obligatorio.";
    if (!formData.email?.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

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
        name={name}
        id={name}
        value={formData[name] || ""}
        onChange={onChange}
        placeholder={label}
        tabIndex={tabIndex}
        className="modal-input"
        required={required}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Crear nuevo paciente</h2>

        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="grid gap-y-4" noValidate>
              {/* Datos del paciente */}
              <div className="w-full">
                <h6 className="modal-section-title">1. Datos del Paciente</h6>
                <p className="text-gray-600 text-sm mb-2 mt-2">
                  Introduce la información básica del paciente, como su nombre,
                  apellidos y datos de contacto.
                </p>
                <hr className="mb-4 mt-2" />
              </div>

              <div className="modal-content-pacientes">
                <div>
                  <label htmlFor="nombre" className="modal-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={formData.nombre || ""}
                    onChange={onChange}
                    placeholder="Nombre del paciente"
                    ref={firstInputRef}
                    tabIndex="1"
                    autoFocus
                    className="modal-input"
                    required
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                  )}
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
                {renderInput("Email", "email", "email", true, 4)}
                {renderInput("Teléfono", "phone", "text", false, 5)}
                {renderInput(
                  "Fecha de Nacimiento",
                  "fecha_nacimiento",
                  "date",
                  false,
                  6
                )}
                {renderInput("DNI/NIF", "dni", "text", false, 7)}
                {renderInput("Dirección", "address", "text", false, 8)}
                {renderInput("Ciudad", "city", "text", false, 9)}
                {renderInput("Código Postal", "code_postal", "text", false, 10)}
                {renderInput("País", "country", "text", false, 11)}
              </div>

              {/* Datos clínicos */}
              <div className="w-full mt-2">
                <h6 className="modal-section-title">
                  2. Datos Clínicos del Paciente
                </h6>
                <p className="text-gray-600 text-sm mb-2">
                  Registra si el paciente tiene alguna patología o alergia
                  relevante para el tratamiento.
                </p>
                <hr className="mb-6 mt-2 border-gray-300" />

                {/* Patologías */}
                <div>
                  <label className="modal-label mb-2">Patologías</label>
                  <button
                    type="button"
                    onClick={handleAddPathology}
                    className="btn-patologias"
                  >
                    Añadir Patología
                  </button>

                  <div className="mt-3">
                    {formData.patologias?.length > 0 ? (
                      <ul className="lista-patologias-ul">
                        {formData.patologias.map((pathology, index) => (
                          <li key={index} className="lista-patologias-li">
                            <span className="patologia-texto">{pathology}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePathology(index)}
                              className="patologia-btn-delete"
                            >
                              Eliminar
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No se han añadido patologías aún.
                      </p>
                    )}
                  </div>
                </div>

                {/* Alergias */}
                <div>
                  <label className="modal-label mb-2">¿Tiene alergias?</label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.alergias}
                      onChange={handleCheckboxChange}
                      className="form-checkbox h-5 w-5 text-black focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.alergias ? "Sí" : "No"}
                    </span>
                  </label>
                </div>

                {/* Notas */}
                <div>
                  <label htmlFor="notas" className="modal-label mb-2">
                    Notas
                  </label>
                  <textarea
                    name="notas"
                    id="notas"
                    rows="4"
                    value={formData.notas || ""}
                    onChange={handleNotasChange}
                    placeholder="Escribe notas sobre el paciente..."
                    className="notas-textarea"
                  />
                </div>
              </div>

              {/* Documentación */}
              <div className="w-full mt-2">
                <h6 className="modal-section-title">
                  3. Documentación del Paciente
                </h6>
                <p className="text-gray-600 text-sm mb-2">
                  Sube los documentos requeridos para cumplir con la legislación
                  vigente.
                </p>
                <hr className="mb-4 mt-2" />

                {/* Protección de datos */}
                <div className="mb-4">
                  <label
                    htmlFor="proteccion_datos"
                    className="label-protecciondatos"
                  >
                    Protección de Datos (PDF)
                  </label>

                  <div className="section-datos">
                    <input
                      id="proteccion_datos"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        handleFileChange(e, "pdf_firmado_general")
                      }
                      className="peer hidden"
                      required
                    />
                    <label
                      htmlFor="proteccion_datos"
                      className="btn-datos-label"
                    >
                      Subir PDF
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.pdf_firmado_general?.name || ""}
                      placeholder="Selecciona un archivo..."
                      className="btn-datos-input"
                    />
                  </div>
                  {errors.pdf_firmado_general && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pdf_firmado_general}
                    </p>
                  )}

                  {/* Consentimiento menor */}
                  <label
                    htmlFor="consentimiento_menor"
                    className="label-protecciondatos mt-2"
                  >
                    Consentimiento del menor (PDF)
                  </label>
                  <div className="section-datos">
                    <input
                      id="consentimiento_menor"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e, "pdf_firmado_menor")}
                      className="peer hidden"
                      required
                    />
                    <label
                      htmlFor="consentimiento_menor"
                      className="btn-datos-label"
                    >
                      Subir PDF
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.pdf_firmado_menor?.name || ""}
                      placeholder="Selecciona un archivo..."
                      className="btn-datos-input"
                    />
                  </div>
                  {errors.pdf_firmado_menor && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pdf_firmado_menor}
                    </p>
                  )}
                </div>
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

export default CrearPacienteModal;
