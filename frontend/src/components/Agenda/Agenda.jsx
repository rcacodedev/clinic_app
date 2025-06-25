import React, { useState } from "react";
import VistaMes from "./VistaMes";
import VistaSemana from "./VistaSemana";
import VistaAgenda from "./VistaAgenda";
import VistaEmpleado from "./VistaEmpleado";
import VistaSemanalDS from "./VistaSemanaDS";

function Agenda() {
  const [activarTab, setActivarTab] = useState("semana");

  const renderContent = () => {
    switch (activarTab) {
      case "mes":
        return <VistaMes />;
      case "semana":
        return <VistaSemanalDS />;
      case "agenda":
        return <VistaAgenda />;
      case "empleados":
        return <VistaEmpleado />;
      case "pruebas":
        return <VistaSemana />;
      default:
        return null;
    }
  };

  return (
    <div className="tab-container">
      <div className="tab-content">
        {/* Tabs */}
        <div className="tabs">
          {["mes", "semana", "agenda", "empleados", "pruebas"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivarTab(tab)}
              className={`px-6 py-2 text-sm font-semibold capitalize transition-all duration-200 ease-in-out
                ${
                  activarTab === tab
                    ? "border-b-4 border-tan text-tan dark:text-tan"
                    : "text-gray-500 dark:text-gray-400 hover:text-white dark:hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="tab-content flex-1 mt-6 animate-fade-in"
          key={activarTab}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Agenda;
