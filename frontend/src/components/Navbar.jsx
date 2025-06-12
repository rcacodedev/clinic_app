import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken, decodeJWT } from "../utils/auth";
import Logo from "./Logo";
import { fetchUserInfo } from "../services/userInfoService";

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.groups && decoded.groups.includes("Admin")) {
        setIsAdmin(true);
      }
    }

    const getUserInfo = async () => {
      try {
        const data = await fetchUserInfo();
        setUserPhoto(data);
      } catch (error) {
        console.error("Error al cargar la foto", error);
      }
    };

    getUserInfo();
  }, []);

  return (
    <>
      <button
        data-drawer-target="logo-sidebar"
        data-drawer-toggle="logo-sidebar"
        aria-controls="logo-sidebar"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-black rounded-lg md:hidden hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-vanilla"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-40 h-screen pt-5 transition-transform bg-zinc-800 border-r border-gray-800  ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-label="Sidebar"
      >
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-2 right-2 text-white hover:bg-zinc-600 focus:outline-none"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <div className="h-full px-3 pb-4 overflow-y-auto bg-zinc-800 ">
          <ul className="space-y-2 font-medium  bg-zinc-800 mt-10">
            <li>
              <Link
                to="/"
                className="flex items-center p-2 pb-10  bg-zinc-800 rounded-lg text-white hover:bg-zinc-600 group"
              >
                <Logo />
              </Link>
            </li>
            <li>
              <Link
                to="/pacientes"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path
                    d="M7 16.488l1.526-.723c1.792-.81 2.851-.344 4.349.232 1.716.661 2.365.883 3.077 1.164 1.278.506.688 2.177-.592 1.838-.778-.206-2.812-.795-3.38-.931-.64-.154-.93.602-.323.818 1.106.393 2.663.79 3.494 1.007.831.218 1.295-.145 1.881-.611.906-.72 2.968-2.909 2.968-2.909.842-.799 1.991-.135 1.991.72 0 .23-.083.474-.276.707-2.328 2.793-3.06 3.642-4.568 5.226-.623.655-1.342.974-2.204.974-.442 0-.922-.084-1.443-.25-1.825-.581-4.172-1.313-6.5-1.6v-5.662zm-1 6.538h-4v-8h4v8zm1-7.869v-1.714c-.006-1.557.062-2.447 1.854-2.861 1.963-.453 4.315-.859 3.384-2.577-2.761-5.092-.787-7.979 2.177-7.979 2.907 0 4.93 2.78 2.177 7.979-.904 1.708 1.378 2.114 3.384 2.577 1.799.415 1.859 1.311 1.853 2.879 0 .13-.011 1.171 0 1.665-.483-.309-1.442-.552-2.187.106-.535.472-.568.504-1.783 1.629-1.75-.831-4.456-1.883-6.214-2.478-.896-.304-2.04-.308-2.962.075l-1.683.699z"
                    fill="white"
                  />
                </svg>
                <span className="ms-3">Pacientes</span>
              </Link>
            </li>
            <li>
              <Link
                to="/citas"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path
                    d="M22.002 13c0-5.522-4.475-10.001-10.002-10.001-5.523 0-10.001 4.479-10.001 10.001 0 4.316 3.087 10 10.001 10 6.93 0 10.002-5.693 10.002-10zm-10.002 8c-4.411 0-8.001-3.59-8.001-8 0-4.413 3.59-8.001 8.001-8.001 4.412 0 8.002 3.588 8.002 8.001 0 4.41-3.59 8-8.002 8zm1.001-9h3v2h-3v3h-2v-3h-3v-2h3v-3h2v3zm-12.198-3.285c-.535-.824-.802-1.772-.802-2.718 0-2.757 2.233-4.995 4.991-4.995.948 0 1.896.268 2.721.803-3.172 1.217-5.692 3.739-6.91 6.91zm18.201-7.715c-.947 0-1.895.268-2.719.803 3.17 1.218 5.694 3.739 6.914 6.909.534-.823.801-1.77.801-2.717 0-2.761-2.236-4.995-4.996-4.995z"
                    fill="white"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Citas</span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  to="/workers"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M23.995 24h-1.995c0-3.104.119-3.55-1.761-3.986-2.877-.664-5.594-1.291-6.584-3.458-.361-.791-.601-2.095.31-3.814 2.042-3.857 2.554-7.165 1.403-9.076-1.341-2.229-5.413-2.241-6.766.034-1.154 1.937-.635 5.227 1.424 9.025.93 1.712.697 3.02.338 3.815-.982 2.178-3.675 2.799-6.525 3.456-1.964.454-1.839.87-1.839 4.004h-1.995l-.005-1.241c0-2.52.199-3.975 3.178-4.663 3.365-.777 6.688-1.473 5.09-4.418-4.733-8.729-1.35-13.678 3.732-13.678 4.983 0 8.451 4.766 3.732 13.678-1.551 2.928 1.65 3.624 5.09 4.418 2.979.688 3.178 2.143 3.178 4.663l-.005 1.241zm-5.995-3h-5v2h5v-2z"
                      fill="white"
                    />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Empleados
                  </span>
                </Link>
              </li>
            )}
            {!isAdmin && (
              <li>
                <Link
                  to="/documentacion"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-900 dark:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.362 2c4.156 0 2.638 6 2.638 6s6-1.65 6 2.457v11.543h-16v-20h7.362zm.827-2h-10.189v24h20v-14.386c0-2.391-6.648-9.614-9.811-9.614zm4.811 13h-10v-1h10v1zm0 2h-10v1h10v-1zm0 3h-10v1h10v-1z" />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Documentación
                  </span>
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/facturacion"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12.611 13.663c.262-.187.559-.274.849-.274.616 0 1.21.392 1.405 1.044-.249-.191-.541-.285-.836-.285-.301 0-.603.097-.866.285-.522.374-.753 1.009-.551 1.611-.814-.581-.819-1.795-.001-2.381zm2.073 7.831c.651.218 2.665.772 4.999 2.506l4.317-3.088c-1.123-1.569-.816-2.669-1.932-4.229-.499-.695-.939-1.12-1.755-.977l-.234.043.394.548c.239.335-.267.683-.499.357l-.351-.49c-.124-.174-.34-.256-.548-.21l-.796.179.478.666c.24.336-.267.681-.499.356l-.412-.576c-.129-.18-.353-.26-.562-.208l-.809.203.504.705c.241.336-.267.682-.499.357l-1.658-2.334c-.269-.376-.793-.463-1.17-.194-.376.27-.464.793-.193 1.17l2.632 3.7c-.812-.299-2.059-.426-2.289.411-.139.501.262.898.882 1.105zm-.684-18.494h-11v5h11v-5zm-7 9h3v-2h-3v2zm-1-2h-3v2h3v-2zm0 3h-3v2h3v-2zm-3 5h3v-2h-3v2zm7-5h-3v2h3v-2zm2.306 6h-10.306v-17h13v9.75c1.487.733 2 2.546 2 2.546v-14.296h-17v21h11.821c-.128-.802.049-1.379.485-2zm-1.306-9v2h.507c.709-.486 1.569-.711 2.493-.568v-1.432h-3zm-1 6h-3v2h3v-2z"
                    fill="white"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Facturación
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/formacion"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path
                    d="M22 9.74l-2 1.02v7.24c-1.007 2.041-5.606 3-8.5 3-3.175 0-7.389-.994-8.5-3v-7.796l-3-1.896 12-5.308 11 6.231v8.769l1 3h-3l1-3v-8.26zm-18 1.095v6.873c.958 1.28 4.217 2.292 7.5 2.292 2.894 0 6.589-.959 7.5-2.269v-6.462l-7.923 4.039-7.077-4.473zm-1.881-2.371l9.011 5.694 9.759-4.974-8.944-5.066-9.826 4.346z"
                    fill="white"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Formación</span>
              </Link>
            </li>
            <li>
              <Link
                to="/actividades"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path
                    d="M24 24h-24v-2h2v-14h-2v-2h24v2h-2v14h2v2zm-13-5h-2v4h2v-4zm4 0h-2v4h2v-4zm5-11h-16v14h3v-5h10v5h3v-14zm-6 7h-4v-5h4v5zm-5 0h-4v-5h4v5zm10 0h-4v-5h4v5zm-10-12v1c0 .551-.447 1-1 1-.552 0-1-.448-1-1v-3c0-.552.448-1 1-1 .553 0 1 .449 1 1v1h6v-1c0-.551.447-1 1-1 .553 0 1 .449 1 1v3c0 .551-.447 1-1 1-.553 0-1-.449-1-1v-1h-6zm9.5 0v.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v.5h.5v1h-.5zm-13-1v-.5c0-.276.224-.5.5-.5s.5.224.5.5v2c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-.5h-.5v-1h.5z"
                    fill="white"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Actividades
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/ajustes"
                className="flex items-center p-2 mt-64 text-gray-900 rounded-lg dark:text-white hover:bg-zinc-600 group"
              >
                {userPhoto?.photo ? (
                  <div className="w-14 h-14 rounded-full bg-white p-0.5">
                    <img
                      src={userPhoto.photo}
                      alt="Foto de perfil"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-full dark:bg-gray-600 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <span className="flex-1 ms-3 whitespace-nowrap">Mi perfil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="flex items-center p-2 text-gray-900 rounded-lg  dark:text-white hover:bg-zinc-600 group"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path
                    d="M13 2v-2l10 3v18l-10 3v-2h-9v-7h1v6h8v-18h-8v7h-1v-8h9zm-2.947 10l-3.293-3.293.707-.707 4.5 4.5-4.5 4.5-.707-.707 3.293-3.293h-9.053v-1h9.053z"
                    fill="white"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Cerrar Sesión
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
