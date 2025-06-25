import React, { useEffect, useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";

const EditarEmpleadoModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  groups,
  allGroups,
}) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [color, setColor] = useState(formData.color || "#ffffff");
  const colorPickerRef = useRef(null);

  // Sincronizar color local cuando cambie formData.color
  useEffect(() => {
    setColor(formData.color || "#ffffff");
  }, [formData.color]);

  if (!isOpen) return null;

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setFormData((prevState) => ({
      ...prevState,
      color: newColor,
    }));
  };

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

    // Puedes agregar validaciones aquí

    onSubmit(formData); // <-- PASAMOS LOS DATOS ACTUALIZADOS
  };

  console.log(groups);

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Editar Empleado</h2>
        <div className="modal-pacientes-container">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="grid gap-y-4" noValidate>
              <div className="w-full mt-2">
                <h6 className="modal-section-title">
                  1. Departamento del Empleado
                </h6>
                <p className="text-gray-600 text-sm mb-2">
                  Cambia el departamento asignado.
                </p>
                <hr className="mb-6 mt-2 border-gray-300" />
                <div>
                  <label className="modal-label">Departamento:</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allGroups.map((group) => {
                      const isSelected = formData.groups.includes(group.id);
                      return (
                        <button
                          type="button"
                          key={group.id}
                          onClick={() => {
                            setFormData((prev) => {
                              const alreadySelected = prev.groups.includes(
                                group.id
                              );
                              return {
                                ...prev,
                                groups: alreadySelected
                                  ? prev.groups.filter((id) => id !== group.id)
                                  : [...prev.groups, group.id],
                              };
                            });
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium border ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300"
                          } hover:shadow`}
                        >
                          {group.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="w-full mt-2">
                <h6 className="modal-section-title">2. Color del Empleado</h6>
                <p className="text-gray-600 text-sm mb-2">
                  Cambia el color que identifica al empleado.
                </p>
                <hr className="mb-6 mt-2 border-gray-300" />
                <div>
                  <label htmlFor="color">Selecciona Color:</label>
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
                  Cancelar
                </button>
                <button type="submit" className="btn-save-modal">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarEmpleadoModal;
