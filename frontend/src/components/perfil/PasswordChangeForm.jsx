import React from "react";

const PasswordChangeForm = ({
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  error,
  message,
  onSubmit,
}) => {
  return (
    <>
      <h2 className="title-section mb-3">Cambiar Contraseña</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <section>
          <form onSubmit={onSubmit} className="space-y-6">
            {[
              {
                label: "Contraseña Actual",
                id: "currentPassword",
                value: currentPassword,
                setter: setCurrentPassword,
              },
              {
                label: "Nueva Contraseña",
                id: "newPassword",
                value: newPassword,
                setter: setNewPassword,
              },
              {
                label: "Confirmar Nueva Contraseña",
                id: "confirmPassword",
                value: confirmPassword,
                setter: setConfirmPassword,
              },
            ].map(({ label, id, value, setter }) => (
              <div key={id} className="space-y-1">
                <label htmlFor={id} className="label-protecciondatos">
                  {label}
                </label>
                <input
                  type="password"
                  id={id}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  required
                  className="modal-input"
                  placeholder={label}
                />
                {id === "newPassword" && (
                  <small className="text-gray-500">
                    Mínimo 8 caracteres, 1 mayúscula y 1 número.
                  </small>
                )}
                {id === "confirmPassword" && (
                  <small className="text-gray-500">
                    Debe coincidir con la nueva contraseña.
                  </small>
                )}
              </div>
            ))}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <button
              type="submit"
              className="bg-negro hover:bg-tan text-white font-semibold px-6 py-2 rounded shadow"
            >
              Cambiar Contraseña
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default PasswordChangeForm;
