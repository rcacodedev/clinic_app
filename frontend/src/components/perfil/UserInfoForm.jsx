import React, { useState } from "react";

const labelOverrides = {
  city: "Ciudad",
  address: "Dirección",
  phone: "Teléfono",
  dni: "DNI",
  postal_code: "Código Postal",
  country: "País",
};

const UserInfoForm = ({
  userInfo,
  setUserInfo,
  isEditing,
  setIsEditing,
  onSubmit,
  infoError,
  infoMessage,
}) => {
  const [isTwilioVisible, setIsTwilioVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section>
      <h2 className="text-3xl font-bold text-black mb-8 border-b-4 border-tan text-left">
        Actualizar Información
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        {[
          "segundo_apellido",
          "phone",
          "address",
          "fecha_nacimiento",
          "dni",
          "postal_code",
          "city",
          "country",
          "whatsapp_business_number",
          "twilio_whatsapp_service_sid",
          "twilio_integration_verified",
        ].map((key) => (
          <div key={key} className="space-y-1">
            <label
              htmlFor={key}
              className="block text-sm font-semibold text-gray-900 capitalize"
            >
              {labelOverrides[key] || key.replace(/_/g, " ")}
            </label>

            {isEditing ? (
              key === "twilio_whatsapp_service_sid" ? (
                <div className="relative">
                  <input
                    type={isTwilioVisible ? "text" : "password"}
                    id={key}
                    name={key}
                    value={userInfo[key]}
                    onChange={handleChange}
                    placeholder="SID de Twilio"
                    className="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring focus:border-tan"
                  />
                  <span
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer text-lg"
                    onClick={() => setIsTwilioVisible(!isTwilioVisible)}
                    title={isTwilioVisible ? "Ocultar SID" : "Mostrar SID"}
                  >
                    {isTwilioVisible ? "🙈" : "👁️"}
                  </span>
                </div>
              ) : (
                <input
                  type={key === "fecha_nacimiento" ? "date" : "text"}
                  id={key}
                  name={key}
                  value={userInfo[key]}
                  onChange={handleChange}
                  required={["phone", "dni", "address"].includes(key)}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-tan"
                  placeholder={`Tu ${key.replace(/_/g, " ")}`}
                />
              )
            ) : (
              <p className="text-gray-600">
                {typeof userInfo[key] === "object" && userInfo[key] !== null
                  ? "Información no disponible"
                  : userInfo[key]}
              </p>
            )}

            {key === "phone" && (
              <small className="text-gray-400">Ej: 666123456</small>
            )}
            {key === "fecha_nacimiento" && (
              <small className="text-gray-400">Ej: 2000-12-01</small>
            )}
            {key === "dni" && (
              <small className="text-gray-400">Ej: 12345678A</small>
            )}
            {key === "whatsapp_business_number" && (
              <small className="text-gray-400">Ej: +34666123456</small>
            )}
          </div>
        ))}
        {infoError && <p className="text-red-600 text-sm">{infoError}</p>}
        {infoMessage && <p className="text-green-600 text-sm">{infoMessage}</p>}
        <button
          type="button"
          style={{ backgroundColor: "negro", color: "white" }}
          className="font-semibold px-6 py-2 rounded shadow"
          onClick={(e) => (isEditing ? onSubmit(e) : setIsEditing(true))}
        >
          {isEditing ? "Guardar Cambios" : "Editar Información"}
        </button>
      </form>
    </section>
  );
};

export default UserInfoForm;
