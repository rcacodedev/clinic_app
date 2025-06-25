import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import LoadingIndicator from "../LoadingIndicator";
import Logo from "../../assets/logo.svg";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert("Error al enviar los datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center sm:py-12">
      <div className="flex flex-col md:flex-row bg-white shadow rounded-lg overflow-hidden md:w-full md:max-w-4xl">
        {/* Logo a la izquierda */}
        <div className="flex justify-center items-center bg-white p-10 md:w-1/2">
          <img src={Logo} alt="Logo de la clínica" className="w-48 h-48" />
        </div>

        {/* Formulario a la derecha */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 p-10 divide-y divide-gray-200"
        >
          <div className="pb-7">
            <label className="font-semibold text-sm text-gray-600 pb-1 block">
              Username
            </label>
            <input
              type="text"
              className="border border-zinc-700 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-300 rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />

            <label className="font-semibold text-sm text-gray-600 pb-1 block">
              Password
            </label>
            <input
              type="password"
              className="border border-zinc-700 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-300 rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            {loading && (
              <div className="mb-4">
                <LoadingIndicator />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="transition duration-200 bg-zinc-500 hover:bg-zinc-600 focus:bg-zinc-700 focus:shadow-sm focus:ring-4 focus:ring-zinc-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
            >
              <span className="inline-block mr-2">
                {method === "login" ? "Login" : "Register"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4 inline-block"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>

          <div className="pt-5 text-center">
            <button
              type="button"
              className="transition duration-200 mx-5 px-5 py-4 font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
              onClick={() => navigate("/forgot-password")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4 inline-block align-text-top"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              <span className="inline-block ml-1">Olvidé mi contraseña</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form;
