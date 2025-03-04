import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { getToken, decodeJWT } from "../utils/auth";
import homeIcon from "../assets/home.svg";
import pacienteIcon from "../assets/paciente.svg";
import citasIcon from "../assets/citas.svg";
import workersIcon from "../assets/workers.svg";
import actividadesIcon from "../assets/actividades.svg";
import logoutIcon from "../assets/salir.svg";
import ajusteIcon from "../assets/ajuste.svg";
import finanzasIcon from "../assets/coin.svg";
import formacionIcon from "../assets/formacion.svg";
import documentacionIcon from "../assets/documentacion.svg";

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.groups && decoded.groups.includes('Admin')){
        setIsAdmin(true);
      }
    }
  }, []);

  return (
    <nav className="navbar">
      {/* Contenedor de los botones principales */}
      <div className="navbar-buttons">
        <div className="navbar-items">
          <div className="navbar-button">
            <Link to="/">
              <div className="navbar-content">
                <img src={homeIcon} alt="Inicio" className="navbar-icon" />
                <span className="navbar-text">Inicio</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="api/pacientes">
              <div className="navbar-content">
                <img src={pacienteIcon} alt="Pacientes" className="navbar-icon" />
                <span className="navbar-text">Pacientes</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="api/citas">
              <div className="navbar-content">
                <img src={citasIcon} alt="Citas" className="navbar-icon" />
                <span className="navbar-text">Citas</span>
              </div>
            </Link>
          </div>
          {
            !isAdmin && (
              <div className="navbar-button">
              <Link to="api/documentacion">
                <div className="navbar-content">
                  <img src={documentacionIcon} alt="Documentacion" className="navbar-icon" />
                  <span className="navbar-text">Documentación</span>
                </div>
              </Link>
            </div>
            )
          }
          {
            isAdmin && (
              <div className="navbar-button">
              <Link to="api/workers">
                <div className="navbar-content">
                  <img src={workersIcon} alt="Workers" className="navbar-icon" />
                  <span className="navbar-text">Empleados</span>
                </div>
              </Link>
            </div>
          )}
          <div className="navbar-button">
            <Link to="api/actividades">
              <div className="navbar-content">
                <img src={actividadesIcon} alt="Actividades" className="navbar-icon" />
                <span className="navbar-text">Actividades</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="api/formacion">
              <div className="navbar-content">
                <img src={formacionIcon} alt="Formacion" className="navbar-icon" />
                <span className="navbar-text">Formación</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="api/finanzas">
              <div className="navbar-content">
                <img src={finanzasIcon} alt="Finanzas" className="navbar-icon" />
                <span className="navbar-text">Finanzas</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="api/ajustes">
              <div className="navbar-content">
                <img src={ajusteIcon} alt="Ajustes" className="navbar-icon" />
                <span className="navbar-text">Mi Perfil</span>
              </div>
            </Link>
          </div>
        </div>
        {/* Botón de logout */}
        <div className="navbar-button navbar-logout">
          <Link to="/logout">
            <div className="navbar-content">
              <img src={logoutIcon} alt="Cerrar sesión" className="navbar-icon" />
              <span className="navbar-text">Cerrar sesión</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
