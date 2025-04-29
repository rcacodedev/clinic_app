import React, { useState, useEffect } from "react";
import api from "../services/api"; // Reutilizamos tu configuración de Axios
import { fetchUserInfo, updateUserInfo, updatePhoto } from "../services/userInfoService";
import "../styles/ajustes.css";
import Boton from "../components/Boton";

const Ajustes = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Estados para los datos de userInfo
  const [userInfo, setUserInfo] = useState({
    user: { first_name: "", last_name: "" }, // Aseguramos que user tenga un valor inicial
    segundo_apellido: "",
    address: "",
    phone: "",
    fecha_nacimiento: "",
    dni: "",
    postal_code: "",
    city: "",
    country: "",
    photo: "", // Asegurándonos de tener un campo photo en el objeto userInfo
    whatsapp_business_number: "",
    twilio_whatsapp_service_sid: "",
    twilio_integration_verified:"",
  });

  const [infoMessage, setInfoMessage] = useState("");
  const [infoError, setInfoError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar si estamos en modo edición
  const [newPhoto, setNewPhoto] = useState(null); // Estado para manejar la nueva foto seleccionada
  const [isTwilioVisible, setIsTwilioVisible] = useState(false);

  const loadUserInfo = async () => {
    try {
      const data = await fetchUserInfo();
      setUserInfo(data); // Carga los datos en el estado
    } catch (err) {
      console.error("Error al cargar userInfo:", err);
    }
  };

  // Cargar los datos de userInfo al montar el componente
  useEffect(() => {
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
      // Creamos una copia de userInfo excluyendo "photo"
      const { photo, ...userInfoWithoutPhoto } = userInfo;

      const updatedData = await updateUserInfo(userInfoWithoutPhoto);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!newPhoto) {
      setError("No se ha seleccionado ninguna foto.");
      return;
    }

    try {
      const response = await updatePhoto(newPhoto);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        photo: response.photo, // Suponiendo que la respuesta contiene la URL de la foto actualizada
      }));
      setNewPhoto(null); // Limpiar el estado de la foto seleccionada
      loadUserInfo();
    } catch (err) {
      setError("Error al subir la foto.");
      console.error(err);
    }
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
      <div className="info-user">
        <h1>Perfil de {userInfo.user.first_name} {userInfo.user.last_name}</h1>
        {/* Foto de perfil */}
        <div className="photo-container">
          <img
            src={userInfo.photo} // Asegúrate de que haya una foto o usa una por defecto
            alt="Foto de perfil"
            className="profile-photo"
            onClick={() => document.getElementById("photoInput").click()} // Al hacer clic en la foto, abre el selector de archivos
          />
          <input
            type="file"
            id="photoInput"
            style={{ display: "none" }} // Ocultamos el input de tipo file
            onChange={handlePhotoChange}
          />
          <Boton onClick={handlePhotoUpload} texto="Subir Foto" />
        </div>
      </div>
      <div className="update-user-info">
        <h2>Actualizar Información de Usuario</h2>
        <form onSubmit={handleUserInfoSubmit} className="user-form">
          {["segundo_apellido", "phone", "address", "fecha_nacimiento", "dni", "postal_code", "city", "country", "whatsapp_business_number", "twilio_whatsapp_service_sid", "twilio_integration_verified"]
            .filter((key) => key !== "user" && key !== 'photo') // Filtramos el campo "user" para que nunca se muestre
            .map((key) => (
              <div key={key} className="form-group">
                <label htmlFor={key}>{key.replace("_", " ").toUpperCase()}</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={userInfo[key]}
                      onChange={handleUserInfoChange}
                      placeholder={`Ingresa tu ${key.replace("_", " ")}`}
                    />
                    {/* Aquí agregamos las instrucciones solo cuando el campo sea correspondiente */}
                    {key === 'phone' && (
                      <small className="input-help-text">Introduce un nº de un teléfono móvil.</small>
                    )}
                    {key === 'fecha_nacimiento' && (
                      <small className="input-help-text">Formato de fecha: 2000-12-01</small>
                    )}
                    {key === 'dni' && (
                      <small className="input-help-text">Formato de DNI: 53564522W</small>
                    )}
                    {key === 'whatsapp_business_number' && (
                      <small className="input-help-text">Añadir el teléfono registrado en Twilio (usar antes +34)</small>
                    )}
                    {key === 'twilio_whatsapp_service_sid' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsTwilioVisible(!isTwilioVisible)}
                          className="ver-sid-button"
                        >
                          {isTwilioVisible ? "Ocultar SID" : "Ver SID"}
                        </button>
                        {isTwilioVisible && (
                          <input
                            type="password"
                            id={key}
                            name={key}
                            value={userInfo[key]}
                            onChange={handleUserInfoChange}
                            placeholder="SID de Twilio"
                          />
                        )}
                      </div>
                    )}
                  </div>
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

      <div className="change-password">
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
            <small className="input-help-text">Ingresa la contraseña que usas actualmente.</small>
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
            <small className="input-help-text">Debe tener al menos 8 caracteres, incluyendo una mayúscula y un número.</small>
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
            <small className="input-help-text">Debe coincidir con la nueva contraseña ingresada.</small>
          </div>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit" className="submit-button">
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default Ajustes;
