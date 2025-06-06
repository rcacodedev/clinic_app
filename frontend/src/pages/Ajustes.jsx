import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  fetchUserInfo,
  updateUserInfo,
  updatePhoto,
} from "../services/userInfoService";
import PasswordChangeForm from "../components/perfil/PasswordChangeForm";
import EditarUserModal from "../components/perfil/EditarUserModal";
import { toast } from "react-toastify";

const Ajustes = () => {
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    address: "",
    phone: "",
    fecha_nacimiento: "",
    dni: "",
    postal_code: "",
    city: "",
    country: "",
    photo: "",
    whatsapp_business_number: "",
    twilio_whatsapp_service_sid: "",
    twilio_integration_verified: "",
    twilio_account_sid: "",
    twilio_auth_token: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUserInfo = async () => {
    try {
      const data = await fetchUserInfo();
      setUserInfo(data);
    } catch (err) {
      console.error("Error al cargar userInfo:", err);
    }
  };
  // Carga de datos inicial
  useEffect(() => {
    loadUserInfo();
  }, []);

  // Copia los datos cuando empieza a editar
  useEffect(() => {
    if (isEditing) {
      setEditedUserInfo({ ...userInfo });
    }
  }, [isEditing]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const updatedPhoto = await updatePhoto(file);
      setUserInfo((prev) => ({ ...prev, photo: updatedPhoto }));
    } catch (error) {
      alert("Error al actualizar la foto.");
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateUserInfo(editedUserInfo);

      // Si updatedUser tiene un 'user' dentro, aplanamos:
      const normalizedUserInfo = {
        ...updatedUser,
        ...updatedUser.user, // sobreescribe con lo de user si hace falta
      };

      // Luego borramos la propiedad user para evitar confusión
      delete normalizedUserInfo.user;

      setUserInfo(normalizedUserInfo);
      setIsEditing(false);
      toast.success("Información actualizada correctamente");
      loadUserInfo();
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      toast.error("Hubo un error al actualizar la información");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    try {
      await api.put("/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage("Contraseña cambiada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError("Error al cambiar la contraseña");
    }
  };

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Configuración de la cuenta</h1>
        <p className="title-description">
          Datos necesarios del usuario para el uso de la aplicación. Cambio de
          contraseña.
        </p>
      </div>

      <h4 className="title-section">Datos personales del usuario</h4>
      <div className="relative bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="absolute top-6 right-6 flex flex-col items-center">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform"
            onClick={() => document.getElementById("photoInput").click()}
            title="Cambiar foto de perfil"
          >
            {userInfo.photo ? (
              <img
                src={userInfo.photo}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <input
              type="file"
              id="photoInput"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>
          <span className="text-sm text-gray-500 mt-2">
            Haz clic en la imagen para cambiar la foto
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Nombre", value: userInfo.nombre },
            { label: "Primer Apellido", value: userInfo.primer_apellido },
            { label: "Segundo Apellido", value: userInfo.segundo_apellido },
            { label: "Fecha de Nacimiento", value: userInfo.fecha_nacimiento },
            { label: "DNI", value: userInfo.dni },
            { label: "Teléfono", value: userInfo.phone },
            { label: "Dirección", value: userInfo.address },
            { label: "Código Postal", value: userInfo.postal_code },
            { label: "Ciudad", value: userInfo.city },
            { label: "País", value: userInfo.country },
          ].map((item, idx) => (
            <div className="flex flex-col" key={idx}>
              <span className="text-l text-gray-500 font-bold">
                {item.label}
              </span>
              <span className="text-base font-medium text-gray-800">
                {item.value || (
                  <span className="text-gray-400">No disponible</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-6 border-t border-gray-300" />

      <h4 className="title-section">Integración con WhatsApp Business</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-lg mb-8">
        {[
          {
            label: "Número de WhatsApp Business",
            value: userInfo.whatsapp_business_number,
          },
          {
            label: "Twilio Service SID",
            value: userInfo.twilio_whatsapp_service_sid,
          },
          {
            label: "Twilio Account SID",
            value: userInfo.twilio_account_sid,
          },
          {
            label: "Auth Token",
            value: userInfo.twilio_auth_token,
          },
        ].map((item, idx) => (
          <div className="flex flex-col" key={idx}>
            <span className="text-l text-gray-500 font-bold">{item.label}</span>
            <span className="text-base font-medium text-gray-800">
              {item.value || (
                <span className="text-gray-400">No disponible</span>
              )}
            </span>
          </div>
        ))}
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Verificado</span>
          <span
            className={`text-base font-semibold ${
              userInfo.twilio_integration_verified
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {userInfo.twilio_integration_verified ? "Sí" : "No"}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <button onClick={() => setIsEditing(true)} className="btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path d="M21.707,4.475,19.525,2.293a1,1,0,0,0-1.414,0L9.384,11.021a.977.977,0,0,0-.241.39L8.052,14.684A1,1,0,0,0,9,16a.987.987,0,0,0,.316-.052l3.273-1.091a.977.977,0,0,0,.39-.241l8.728-8.727A1,1,0,0,0,21.707,4.475Z" />
            <path d="M2,6A1,1,0,0,1,3,5h8a1,1,0,0,1,0,2H4V20H17V13a1,1,0,0,1,2,0v8a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1Z" />
          </svg>
        </button>
      </div>

      <EditarUserModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        userData={userInfo}
        onSave={handleSave}
        setEditedUserInfo={setEditedUserInfo}
      />

      <hr className="my-6 border-t border-gray-300" />

      <PasswordChangeForm
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        error={error}
        message={message}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
};

export default Ajustes;
