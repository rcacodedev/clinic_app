import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("api/password-reset/request/", {
          email,
          frontend_base_url: "http://localhost:5173", // o el dominio real de tu frontend
        });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Error al enviar el correo.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        {submitted ? (
          <p className="text-green-600">Hemos enviado un enlace para restablecer tu contraseña.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Recuperar contraseña</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Enviar enlace
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
