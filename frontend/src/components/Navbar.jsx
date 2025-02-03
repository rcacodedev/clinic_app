import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

import homeIcon from "../assets/home.svg";
import pacienteIcon from "../assets/paciente.svg";
import citasIcon from "../assets/citas.svg";
import workersIcon from "../assets/workers.svg";
import actividadesIcon from "../assets/actividades.svg";
import logoutIcon from "../assets/salir.svg";
import ajusteIcon from "../assets/ajuste.svg";
import finanzasIcon from "../assets/coin.svg";

const Navbar = () => {
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
            <Link to="/pacientes">
              <div className="navbar-content">
                <img src={pacienteIcon} alt="Pacientes" className="navbar-icon" />
                <span className="navbar-text">Pacientes</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="/citas">
              <div className="navbar-content">
                <img src={citasIcon} alt="Citas" className="navbar-icon" />
                <span className="navbar-text">Citas</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="/workers">
              <div className="navbar-content">
                <img src={workersIcon} alt="Workers" className="navbar-icon" />
                <span className="navbar-text">Workers</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="/actividades">
              <div className="navbar-content">
                <img src={actividadesIcon} alt="Actividades" className="navbar-icon" />
                <span className="navbar-text">Actividades</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="/finanzas">
              <div className="navbar-content">
                <img src={finanzasIcon} alt="Finanzas" className="navbar-icon" />
                <span className="navbar-text">Finanzas</span>
              </div>
            </Link>
          </div>
          <div className="navbar-button">
            <Link to="/ajustes">
              <div className="navbar-content">
                <img src={ajusteIcon} alt="Ajustes" className="navbar-icon" />
                <span className="navbar-text">Ajustes</span>
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
