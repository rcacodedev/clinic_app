import { useState, useEffect, useMemo } from "react";
import {
  getCitas,
  createCita,
  updateCita,
  deleteCita,
} from "../../services/citasService";
import { getPacientes } from "../../services/patientService";
import { toast } from "react-toastify";
import Select from "react-select";

const VistaSemanalDS = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [formData, setFormData] = useState({
    paciente_id: "",
    fecha: "",
    comenzar: "",
    finalizar: "",
    descripcion: "",
  });
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);

  // Obtener el rango de fechas de la semana actual
  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(
      date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
    );

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
  };

  // Formatear fecha para mostrar
  const formatDateDisplay = (start, end) => {
    // Verificar si las fechas están en el mismo mes y año
    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      const options = { month: "long", year: "numeric" };
      return `Del ${start.getDate()} al ${end.getDate()} de ${start.toLocaleDateString(
        "es-ES",
        options
      )}`;
    }

    // Si están en meses o años diferentes, mantener el formato original
    const options = { day: "numeric", month: "long", year: "numeric" };
    return `${start.toLocaleDateString(
      "es-ES",
      options
    )} al ${end.toLocaleDateString("es-ES", options)}`;
  };

  // Función para verificar si es hoy
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Navegación entre semanas
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Obtener citas para la semana actual
  useEffect(() => {
    const { start, end } = getWeekRange(currentDate);
    const fetchCitas = async () => {
      try {
        const citasData = await getCitas();
        setCitas(citasData);
      } catch (error) {
        console.error("Error al obtener citas:", error);
      }
    };

    fetchCitas();
  }, [currentDate]);

  // Generar horas del día
  const hours = Array.from({ length: 17 }, (_, i) => 7 + i);

  // Generar días de la semana
  const getWeekDays = () => {
    const { start } = getWeekRange(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Verificar si una celda está ocupada por una cita
  const isCellOccupied = (day, hour) => {
    const dayString = day.toISOString().split("T")[0];
    return citas.some((cita) => {
      if (cita.fecha !== dayString) return false;
      const startHour = parseInt(cita.comenzar.split(":")[0]);
      const endHour = parseInt(cita.finalizar.split(":")[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  // Manejar clic en celda
  const handleCellClick = (day, hour) => {
    if (isCellOccupied(day, hour)) return;

    const dayString = day.toISOString().split("T")[0];
    const hourString = `${hour}:00`;

    setSelectedDay(dayString);
    setSelectedTime(hourString);

    setFormData({
      paciente_id: "",
      fecha: dayString,
      comenzar: hourString,
      finalizar: `${hour + 1}:00`,
      descripcion: "",
    });

    setShowModal(true);
  };

  // Obtener todas las citas para un día específico
  const getAppointmentsForDay = (day) => {
    const dayString = day.toISOString().split("T")[0];
    return citas.filter((cita) => cita.fecha === dayString);
  };

  // Formatear hora para mostrar
  const formatHour = (hour) => {
    return `${hour}:00`;
  };

  // Formatear nombre del día
  const formatDayName = (date) => {
    return date.toLocaleDateString("es-ES", { weekday: "short" });
  };

  // Formatear número del día
  const formatDayNumber = (date) => {
    return date.getDate();
  };
  const handleAppointmentClick = (cita) => {
    setSelectedCita(cita);

    // Encontrar el paciente correspondiente
    const paciente = pacientes.find((p) => p.value === cita.paciente_id);
    setSelectedPaciente(paciente || null);

    // Actualizar formData con los datos de la cita
    setFormData({
      paciente_id: cita.paciente_id,
      fecha: cita.fecha,
      comenzar: cita.comenzar,
      finalizar: cita.finalizar,
      descripcion: cita.descripcion || "",
    });

    setShowEditModal(true);
  };

  console.log(citas);

  // Renderizado de citas mejorado
  const renderAppointments = (day) => {
    const appointments = getAppointmentsForDay(day);

    return (
      <div className="relative h-full" style={{ pointerEvents: "none" }}>
        {appointments.map((app, index) => {
          const [startHour, startMinute] = app.comenzar.split(":").map(Number);
          const [endHour, endMinute] = app.finalizar.split(":").map(Number);

          const top = (startHour - 7) * 64 + (startMinute / 60) * 64;
          const height =
            (endHour - startHour) * 64 + ((endMinute - startMinute) / 60) * 64;

          return (
            <div
              key={index}
              className="absolute left-1 right-1 rounded-lg bg-zinc-100 border border-zinc-200 p-2 overflow-hidden"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                pointerEvents: "auto", // Habilitar solo para este elemento
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleAppointmentClick(app);
              }}
            >
              <div className="text-xs font-medium text-zinc-800 truncate">
                {app.paciente_nombre}
              </div>
              {app.descripcion && (
                <div className="text-xs text-center text-zinc-500 mt-3 truncate">
                  {app.descripcion}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const { start, end } = getWeekRange(currentDate);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getPacientes();
        const opciones = (data.results || []).map((paciente) => ({
          value: paciente.id,
          label:
            paciente.nombre +
            " " +
            paciente.primer_apellido +
            " " +
            paciente.segundo_apellido,
        }));
        setPacientes(opciones);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };

    fetchPacientes();
  }, []);

  // Actualiza el paciente seleccionado en formData
  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
    setFormData((prev) => ({
      ...prev,
      paciente_id: selectedOption ? selectedOption.value : "",
    }));
  };

  // Maneja cambios en inputs de fecha, hora, descripción
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkForConflicts = (excludeId = null) => {
    const { fecha, comenzar, finalizar } = formData;
    return citas.some(
      (cita) =>
        cita.id !== excludeId && // Excluir la cita que estamos editando
        cita.fecha === fecha &&
        ((comenzar >= cita.comenzar && comenzar < cita.finalizar) ||
          (finalizar > cita.comenzar && finalizar <= cita.finalizar) ||
          (comenzar <= cita.comenzar && finalizar >= cita.finalizar))
    );
  };

  const handleAddCita = async (e) => {
    e.preventDefault();

    if (checkForConflicts()) {
      toast.error("Existe un conflicto con otra cita");
      return;
    }
    try {
      const nuevaCita = await createCita(formData);
      setCitas((prev) => [...prev, nuevaCita]);
      setShowModal(false);
      toast.success("Se creó correctamente la cita");
    } catch (error) {
      console.error(
        "Error al crear la cita",
        error.response?.data || error.message
      );
      toast.error("Error al crear la cita");
    }
  };

  const handleUpdateCita = async () => {
    if (checkForConflicts(selectedCita.id)) {
      toast.error("Existe un conflicto con otra cita");
      return;
    }

    try {
      const citaActualizada = await updateCita(selectedCita.id, formData);
      setCitas((prev) =>
        prev.map((c) => (c.id === selectedCita.id ? citaActualizada : c))
      );
      setShowEditModal(false);
      toast.success("Cita actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar la cita", error);
      toast.error("Error al actualizar la cita");
    }
  };

  const handleDeleteCita = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await deleteCita(selectedCita.id);
        setCitas((prev) => prev.filter((c) => c.id !== selectedCita.id));
        setShowEditModal(false);
        toast.success("Cita eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la cita", error);
        toast.error("Error al eliminar la cita");
      }
    }
  };

  return (
    <div className="p-4 bg-zinc-50 min-h-screen">
      {/* Controles de navegación */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevWeek}
          className="p-2 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-zinc-800">
          {formatDateDisplay(start, end)}
        </h2>

        <button
          onClick={nextWeek}
          className="p-2 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Tabla de agenda */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 shadow-sm">
        <div className="min-w-full bg-white">
          {/* Encabezado con días */}
          <div className="grid grid-cols-8 border-b border-zinc-200 bg-zinc-50/50">
            <div className="p-3 border-r border-zinc-100"></div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-center border-r border-zinc-100 last:border-r-0 ${
                  isToday(day) ? "bg-zinc-300 text-black" : "text-zinc-600"
                }`}
              >
                <div className="text-xs uppercase tracking-wider">
                  {formatDayName(day)}
                </div>
                <div className="text-lg font-medium">
                  {formatDayNumber(day)}
                </div>
              </div>
            ))}
          </div>

          {/* Contenedor principal de la agenda */}
          <div className="relative">
            {/* Líneas de horas (fondo) */}
            <div className="absolute left-0 top-0 w-full h-full grid grid-rows-17 pointer-events-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-zinc-100 last:border-b-0"
                ></div>
              ))}
            </div>

            {/* Columnas de días */}
            <div className="grid grid-cols-8">
              {/* Columna de horas */}
              <div className="border-r border-zinc-200 bg-zinc-50/50">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 p-2 text-zinc-500 text-sm flex items-center justify-center border-b border-zinc-100"
                  >
                    {formatHour(hour)}
                  </div>
                ))}
              </div>

              {/* Columnas de días */}
              {weekDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`relative ${
                    dayIndex < 6 ? "border-r border-zinc-200" : ""
                  }`}
                >
                  {/* Contenedor relativo para las celdas */}
                  <div className="relative h-[1088px]">
                    {/* Celdas clickables - SOLO para creación */}
                    <div className="absolute inset-0">
                      {hours.map((hour) => {
                        const isOccupied = isCellOccupied(day, hour);

                        return (
                          <div
                            key={hour}
                            className={`absolute w-full h-16 border-b border-zinc-100 ${
                              !isOccupied
                                ? "hover:bg-zinc-50/30 cursor-pointer"
                                : ""
                            }`}
                            style={{ top: `${(hour - 7) * 64}px` }}
                            onClick={() =>
                              !isOccupied && handleCellClick(day, hour)
                            }
                          />
                        );
                      })}
                    </div>

                    {/* Citas renderizadas - SOLO para edición */}
                    {renderAppointments(day)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear cita */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-xl font-semibold text-zinc-800">
                Nueva Cita
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                {new Date(selectedDay).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Paciente *
                </label>
                <Select
                  options={pacientes}
                  value={pacientes.find(
                    (p) => p.value === formData.paciente_id
                  )}
                  onChange={handlePacienteChange}
                  placeholder="Buscar paciente..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  noOptionsMessage={() => "No hay pacientes"}
                  loadingMessage={() => "Cargando..."}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hora inicio *
                  </label>
                  <input
                    type="time"
                    name="comenzar"
                    value={formData.comenzar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hora fin *
                  </label>
                  <input
                    type="time"
                    name="finalizar"
                    value={formData.finalizar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Motivo de la consulta..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCita}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Confirmar cita
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-xl font-semibold text-zinc-800">
                Editar Cita
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                {new Date(selectedCita.fecha).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Paciente *
                </label>
                <Select
                  options={pacientes}
                  value={selectedPaciente}
                  onChange={handlePacienteChange}
                  placeholder="Buscar paciente..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  noOptionsMessage={() => "No hay pacientes"}
                  loadingMessage={() => "Cargando..."}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hora inicio *
                  </label>
                  <input
                    type="time"
                    name="comenzar"
                    value={formData.comenzar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hora fin *
                  </label>
                  <input
                    type="time"
                    name="finalizar"
                    value={formData.finalizar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Motivo de la consulta..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 flex justify-between">
              <button
                onClick={handleDeleteCita}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Eliminar cita
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateCita}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaSemanalDS;
