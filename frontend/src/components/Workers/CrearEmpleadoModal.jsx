import React, { useEffect, useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";

const CrearEmpleadoModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  firstInputRef,
  setFormData,
  groups,
}) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [color, setColor] = useState("#ffffff");
  const colorPickerRef = useRef(null);

  if (!isOpen) return null;

  const handleColorChange = (newColor) => {
    setColor(newColor); // Actualiza el color en el estado
    setFormData((prevState) => ({
      ...prevState,
      color: newColor, // Asegura que el color se guarde en formData
    }));
  };

  // Cerrar el selector si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setColorPickerVisible(false);
      }
    };

    if (colorPickerVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPickerVisible]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Las contraseñas no coinciden";
    }
    // Agrega otras validaciones según necesites

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(e);
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
        <h2 className="modal-title">Crear Nuevo Empleado</h2>
        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="grid gap-y-4" noValidate>
              <div className="w-full">
                <h6 className="modal-section-title">
                  1. Datos de acceso a la App
                </h6>
                <p className="text-gray-600 text-sm mb-2 mt-2">
                  Introduce la información necesario para que el empleado pueda
                  acceder a la App
                </p>
                <hr className="mb-4 mt-2" />
              </div>
              <div className="modal-content-pacientes">
                <div>
                  <label htmlFor="username" className="modal-label">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username || ""}
                    onChange={onChange}
                    placeholder="Nombre de Usuario"
                    ref={firstInputRef}
                    tabIndex="1"
                    autoFocus
                    className="modal-input"
                    required
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>
                {renderInput("Email", "email", "email", true, 2)}
                {renderInput("Password", "password", "password", true, 3)}
                {renderInput(
                  "Confirmar Password",
                  "confirm_password",
                  "password",
                  true,
                  4
                )}
                {renderInput("Nombre", "first_name", "text", true, 5)}
                {renderInput("Primer Apellido", "last_name", "text", true, 6)}
              </div>
              <div className="w-full mt-2">
                <h6 className="modal-section-title">
                  2. Selecciona el departamento del empleado
                </h6>
                <p className="text-gray-600 text-sm mb-2">
                  Registra al empleado en su departamento
                </p>
                <hr className="mb-6 mt-2 border-gray-300" />
                <div>
                  <label htmlFor="grupos" className="modal-label">
                    Departamento:
                  </label>
                  <select
                    id="grupos"
                    name="groups"
                    value={formData.groups}
                    className="select-filtro"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groups: [parseInt(e.target.value)],
                      })
                    }
                    required
                  >
                    <option value="">Selecciona un departamento:</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <div className="flecha-filtro">▼</div>
                </div>
              </div>
              <div className="w-full mt-2">
                <h6 className="modal-section-title">
                  3. Selecciona el color del empleado
                </h6>
                <p className="text-gray-600 text-sm mb-2">
                  Selecciona el color que usarás para identificar a este
                  empleado
                </p>
                <hr className="mb-6 mt-2 border-gray-300" />
                <div>
                  <label htmlFor="color">Selecciona Color:</label>
                  {/* Mostrar un recuadro con el color actual */}
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: color,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                      }}
                      onClick={() => setColorPickerVisible(!colorPickerVisible)}
                    ></div>

                    {colorPickerVisible && (
                      <div
                        ref={colorPickerRef}
                        style={{
                          position: "absolute",
                          zIndex: 2,
                          top: "50px",
                          background: "white",
                          padding: "10px",
                          borderRadius: "8px",
                          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
                        }}
                      >
                        <HexColorPicker
                          color={color}
                          onChange={handleColorChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

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

export default CrearEmpleadoModal;
