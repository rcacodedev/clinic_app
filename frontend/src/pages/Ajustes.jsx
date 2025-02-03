import React, { useState, useEffect } from "react";
import api from "../services/api"; // Reutilizamos tu configuración de Axios
import { fetchUserInfo, updateUserInfo } from "../services/userInfoService";
import "../styles/ajustes.css";

const Ajustes = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Estados para los datos de userInfo
  const [userInfo, setUserInfo] = useState({
    address: "",
    phone: "",
    fecha_nacimiento: "",
    dni: "",
    postal_code: "",
    city: "",
    country: "",
    segundo_apellido: "",
  });

  const [infoMessage, setInfoMessage] = useState("");
  const [infoError, setInfoError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar si estamos en modo edición

  // Cargar los datos de userInfo al montar el componente
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const data = await fetchUserInfo();
        setUserInfo(data); // Carga los datos en el estado
      } catch (err) {
        console.error("Error al cargar userInfo:", err);
      }
    };

    loadUserInfo();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      const response = await api.post("/api/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage(response.data.success);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
    }
  };

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault(); // Necesitamos prevenir el comportamiento por defecto
    setInfoMessage("");
    setInfoError("");

    try {
      const updatedData = await updateUserInfo(userInfo);
      setInfoMessage("Información actualizada con éxito.");
      setUserInfo(updatedData); // Actualiza el estado con los datos del backend
      setIsEditing(false); // Vuelve a desactivar el modo de edición
    } catch (err) {
      setInfoError("Error al actualizar la información.");
      console.error(err);
    }
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;

    // Actualiza el objeto userInfo correctamente, manteniendo la estructura
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value, // Esto actualizará el campo correcto dentro del objeto userInfo
    }));
  };

  const renderUserInfo = (key) => {
    const value = userInfo[key];

    // Verificamos si el valor es un objeto o no
    if (typeof value === "object" && value !== null) {
      // Si es un objeto, mostramos algo que no rompa el renderizado (como un texto predeterminado)
      return <span>Información no disponible</span>;
    } else {
      // Si no es un objeto, se muestra el valor directamente
      return <p>{value}</p>;
    }
  };

  return (
    <div className="ajustes-container">
      <h1>Configuración de Cuenta</h1>
      <h2>Cambio de Contraseña</h2>
      <form onSubmit={handlePasswordChange} className="password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Contraseña Actual</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Ingresa tu contraseña actual"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ingresa tu nueva contraseña"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma tu nueva contraseña"
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="submit-button">
          Cambiar Contraseña
        </button>
      </form>

      <h2>Actualizar Información de Usuario</h2>
      <form onSubmit={handleUserInfoSubmit} className="password-form">
        {Object.keys(userInfo)
          .filter((key) => key !== "user") // Filtramos el campo "user" para que nunca se muestre
          .map((key) => (
            <div key={key} className="form-group">
              <label htmlFor={key}>{key.replace("_", " ").toUpperCase()}</label>
              {isEditing ? (
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={userInfo[key]}
                  onChange={handleUserInfoChange}
                  placeholder={`Ingresa tu ${key.replace("_", " ")}`}
                />
              ) : (
                renderUserInfo(key) // Usamos la función renderUserInfo para manejar los casos de objetos
              )}
            </div>
          ))}
        {infoError && <p className="error-message">{infoError}</p>}
        {infoMessage && <p className="success-message">{infoMessage}</p>}
        <button
          type="button"
          className="submit-button"
          onClick={(e) => {
            // Aquí pasamos el evento correctamente
            if (isEditing) {
              handleUserInfoSubmit(e);
            } else {
              setIsEditing(true); // Activar el modo de edición
            }
          }}
        >
          {isEditing ? "Guardar Cambios" : "Actualizar Información"}
        </button>
      </form>
    </div>
  );
};

export default Ajustes;
