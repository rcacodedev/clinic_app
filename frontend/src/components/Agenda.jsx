import React from "react";
import CustomModal from "./Modal";
import Boton from "./Boton";

const Agenda = ({
  citas,
  openModal,
  modalVisible,
  closeModal,
  selectedCita,
  setSelectedCita,
}) => {
  const currentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Ajusta al lunes
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const week = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    setCurrentWeek(week);
  };

  // Cambiar de semana
  const setCurrentWeek = (direction) => {
    setCurrentWeek((prevWeek) =>
      prevWeek.map(
        (day) => new Date(day.getTime() + direction * 7 * 24 * 60 * 60 * 1000)
      )
    );
  };
  const generateWeek = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + i);
      return newDate;
    });
  };

  const changeWeek = (direction) => {
    const newStartDate = new Date(currentWeek[0]);
    newStartDate.setDate(newStartDate.getDate() + direction * 7);
    const newWeek = generateWeek(newStartDate);
    setCurrentWeek(newWeek);
  };

  const changeMonth = (direction) => {
    const newStartDate = new Date(currentWeek[0]);
    newStartDate.setMonth(newStartDate.getMonth() + direction);
    setCurrentWeek(generateWeek(newStartDate));
  };

  // Función para obtener el índice de fila en función del tiempo.
  // Asumimos que la agenda inicia a las 8:00 y cada fila representa 15 minutos.
  const getRowIndex = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h - 8) * 4 + Math.floor(m / 15);
  };
  // Filtra las citas para un día específico usando solo la fecha (ignorando la hora)
  const citasDelDia = (date) =>
    citas.filter(
      (cita) =>
        new Date(cita.fecha + "T00:00").toDateString() === date.toDateString()
    );

  // La función findCita se utiliza para determinar si el slot (intervalo) está ocupado
  // Por ejemplo, si slot corresponde a un intervalo de 15 min en cierta hora del día.
  const findCita = (date, hour, minute) => {
    // Aquí comparamos el día y el intervalo de minutos
    return citas.filter((cita) => {
      const citaFecha = new Date(cita.fecha + "T00:00");
      if (citaFecha.toDateString() !== date.toDateString()) return false;
      const startIndex = getRowIndex(cita.comenzar);
      const endIndex = getRowIndex(cita.finalizar);
      const currentIndex = hour * 4 + minute / 15;
      return startIndex <= currentIndex && currentIndex < endIndex;
    });
  };

  const handleClick = (cita) => {
    if (cita) {
      setSelectedCita(cita);
      openModal(cita); // Modal de edición para cita existente
    }
  };

  const handleSlotClick = (date, hour, minute) => {
    const formattedDate = date
      .toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-");
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    const newCita = {
      fecha: formattedDate,
      comenzar: formattedTime,
      finalizar: "",
      patient_name: "",
      patient_primer_apellido: "",
      descripcion: "",
    };

    // Revisar si la celda tiene una cita asignada
    const existingCita = findCita(date, hour, minute);
    if (existingCita.length > 0) {
      // Si existe una cita, abrir el modal de edición
      setSelectedCita(existingCita[0]);
      openModal(existingCita[0]); // Modal de edición
    } else {
      // Si no existe, abrir el modal de creación
      setSelectedCita(newCita); // Limpiar la cita seleccionada
      openModal(newCita); // Modal de creación
    }
  };

  const hours = Array.from({ length: 57 }, (_, i) => {
    const hour = Math.floor(i / 4) + 8;
    const minute = (i % 4) * 15;
    return { hour, minute };
  });

  const today = new Date().toDateString();
  const currentMonth =
    currentWeek && currentWeek.length > 0
      ? currentWeek[0]
          .toLocaleDateString("es-ES", { month: "long" })
          .toUpperCase()
      : "Mes desconocido";

  // Matriz para marcar las celdas ocupadas (por columna/día y fila/intervalo)
  const numDays = currentWeek.length;
  const numRows = hours.length;
  const occupied = Array.from({ length: numDays }, () =>
    Array(numRows).fill(false)
  );

  return (
    <div className="agenda-container">
      <h1 className="title-section">Agenda de Citas</h1>
      <div className="agenda-controls">
        <Boton onClick={() => changeMonth(-1)} texto="🠔" />
        <h2>{currentMonth}</h2>
        <Boton onClick={() => changeMonth(1)} texto="🠖" />
      </div>
      <div className="agenda-controls">
        <Boton onClick={() => changeWeek(-1)} texto="Semana Anterior" />
        <Boton onClick={() => changeWeek(1)} texto="Semana Siguiente" />
      </div>
      <div className="agenda-scroll-container">
        <table className="agenda-table">
          <thead>
            <tr>
              <th className="agenda-header-hour">Hora</th>
              {currentWeek.map((date) => (
                <th
                  key={date.toISOString()}
                  className={`agenda-header-day ${
                    today === date.toDateString() ? "agenda-today" : ""
                  }`}
                >
                  {date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((time, rowIndex) => (
              <tr key={rowIndex} className="agenda-row">
                <td className="agenda-hour-cell">{`${time.hour}:${time.minute
                  .toString()
                  .padStart(2, "0")}`}</td>
                {currentWeek.map((date, colIndex) => {
                  if (occupied[colIndex][rowIndex]) return null; // Si ya está ocupado, no renderizar
                  // Buscamos si existe una cita que inicia en este intervalo
                  const citasDia = citasDelDia(date);
                  const citaQueInicia = citasDia.find(
                    (cita) => getRowIndex(cita.comenzar) === rowIndex
                  );
                  if (citaQueInicia) {
                    // Calculamos cuántas filas abarca la cita
                    const startIndex = getRowIndex(citaQueInicia.comenzar);
                    const endIndex = getRowIndex(citaQueInicia.finalizar);
                    const rowspan = endIndex - startIndex;
                    // Marcar las celdas que abarca como ocupadas
                    for (let i = rowIndex; i < rowIndex + rowspan; i++) {
                      occupied[colIndex][i] = true;
                    }
                    return (
                      <td
                        key={colIndex}
                        rowSpan={rowspan}
                        className="agenda-slot"
                      >
                        <div
                          className="agenda-cita"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCita(citaQueInicia);
                            openModal(citaQueInicia);
                          }}
                        >
                          <strong className="nombre-paciente">
                            {citaQueInicia.patient_name}{" "}
                            {citaQueInicia.patient_primer_apellido}
                          </strong>
                          <p className="descripcion-cita">
                            {citaQueInicia.descripcion}
                          </p>
                        </div>
                      </td>
                    );
                  } else {
                    return (
                      <td
                        key={colIndex}
                        className="agenda-slot"
                        onClick={() => {
                          // Abrir modal para crear una cita en este intervalo
                          const formattedDate = date
                            .toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                            .split("/")
                            .reverse()
                            .join("-");
                          const formattedTime = `${time.hour
                            .toString()
                            .padStart(2, "0")}:${time.minute
                            .toString()
                            .padStart(2, "0")}`;
                          const newCita = {
                            fecha: formattedDate,
                            comenzar: formattedTime,
                            finalizar: "", // Puedes asignar un valor por defecto si lo deseas
                            patient_name: "",
                            patient_primer_apellido: "",
                            descripcion: "",
                          };
                          setSelectedCita(newCita);
                          openModal(newCita);
                        }}
                      />
                    );
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CustomModal
        isOpen={modalVisible}
        onRequestClose={closeModal}
        title={selectedCita ? "Editar Cita" : "Nueva Cita"}
      >
        {selectedCita ? (
          <div className="modal-body">
            <h3>Paciente: {selectedCita.patient_name || "Nuevo paciente"}</h3>
            <p>{selectedCita.descripcion || "Añadir descripción"}</p>
          </div>
        ) : (
          <p>Cargando información de la cita...</p>
        )}
      </CustomModal>
    </div>
  );
};

export default Agenda;
