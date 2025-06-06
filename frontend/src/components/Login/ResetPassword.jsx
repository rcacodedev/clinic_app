// src/components/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function ResetPassword() {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      await api.post("api/password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      alert("Error al cambiar la contraseña. El enlace puede haber expirado.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        {success ? (
          <p className="text-green-600">Contraseña restablecida con éxito. Serás redirigido al login.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Nueva contraseña</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded mb-4"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label className="block mb-2 text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded mb-4"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Cambiar contraseña
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
