import React, { useState, useEffect, useRef } from "react";
import CustomModal from "../../components/Modal";
import { updateWorker } from "../../services/workerService";
import { fetchGrupos } from "../../services/django";
import { HexColorPicker } from "react-colorful";

const EditarEmpleadoModal = ({ isOpen, onRequestClose, worker, onWorkerUpdated }) => {
  const [color, setColor] = useState(worker.color || "#ffffff");  // Usar el color actual del trabajador
  const [formData, setFormData] = useState({
    email: "",
    dni: "",
    address: "",
    postal_code: "",
    phone: "",
    country: "",
    groups: [],
    color:color,
  });
  const [groupsList, setGroupsList] = useState([]); // Lista de grupos disponibles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false)
  const colorPickerRef = useRef(null);

  // Sincroniza el estado cuando cambia el trabajador
  useEffect(() => {
    if (worker) {
      setFormData({
        email: worker.user?.email || "",
        dni: worker.user.userInfo.dni || "",
        address: worker.user.userInfo.address || "",
        postal_code: worker.user.userInfo.postal_code || "",
        phone: worker.user.userInfo.phone || "",
        country: worker.user.userInfo.country || "",
        groups: worker.groups || [],
        color: worker.color || "#ffffff",
      });
    }
  }, [worker]);

  // Cargar datos de grupos
  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const response = await fetchGrupos();
        setGroupsList(response);
      } catch (error) {
        console.error("Error al cargar los grupos:", error)
      }
    };

    loadGrupos();
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setFormData((prevState) => ({ ...prevState, color: newColor }));
  };

  // Cerrar el selector si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
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

  // Manejo selección de grupos
  const handleGroupToogle = (groupId) => {
    setFormData((prev) => {
      const isSelected = prev.groups.includes(groupId);
      return {
        ...prev,
        groups: isSelected
          ? prev.groups.filter((id) => id !== groupId)
          : [...prev.groups, groupId],
      };
    });
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
    <CustomModal isOpen={isOpen} onRequestClose={onRequestClose} title="Editar Empleado">
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label>Departamento:</label>
        <div className="group-container">
          {groupsList.map((group) => (
            <span
              key={group.id}
              className={`group-chip ${formData.groups.includes(group.id) ? "selected" : ""}`}
              onClick={() => handleGroupToogle(group.id)}
            >
              {group.name}
            </span>
          ))}
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor="color">Selecciona Color:</label>
        {/* Mostrar un recuadro con el color actual */}
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: color,
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
          onClick={() => setColorPickerVisible(!colorPickerVisible)}  // Cambiar la visibilidad del selector
        ></div>
        {/* Mostrar el SketchPicker solo cuando el usuario haga clic */}
        {colorPickerVisible && (
          <div ref={colorPickerRef} style={{ position: "absolute", zIndex: 2, background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0px 2px 10px rgba(0,0,0,0.2)" }}>
            <HexColorPicker color={color} onChange={handleColorChange} />
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  </CustomModal>
  );
};

export default EditarEmpleadoModal;
