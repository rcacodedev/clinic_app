import React, { useEffect, useState, useRef } from "react";
import {
  getCitas,
  createCita,
  updateCita,
  deleteCita,
} from "../../services/citasService";
import { toast } from "react-toastify";
import CrearCitaModal from "../citas/CrearCitaModal";
import EditarCitaModal from "../citas/EditarCitaModal";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const diasSemana = ["Lun", "Mar", "Miér", "Jue", "Vie", "Sáb", "Dom"];
const horas = Array.from(
  { length: 17 },
  (_, i) => `${String(7 + i).padStart(2, "0")}:00`
);
const initialCitaState = {
  patient_id: "",
  fecha: "",
  comenzar: "",
  finalizar: "",
  descripcion: "",
};

const VistaSemanaCitas = () => {
  const [fechaInicioSemana, setFechaInicioSemana] = useState(
    getInicioSemana(new Date())
  );
  const [citas, setCitas] = useState([]);
  const [eventos, setEventos] = useState({});
  const [formData, setFormData] = useState(initialCitaState);
  const [modalCrearCita, setModalCrearCita] = useState(false);
  const [modalEditarCita, setModalEditarCita] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const firstInputRef = useRef();

  function getInicioSemana(date) {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (day - 1));
    return d;
  }

  const getFechaConHora = (diaIndex, horaStr) => {
    const [h, m] = horaStr.split(":");
    const fecha = new Date(fechaInicioSemana);
    fecha.setDate(fecha.getDate() + diaIndex);
    fecha.setHours(parseInt(h));
    fecha.setMinutes(parseInt(m));
    return fecha;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaInicioSemana]);

  const fetchCitas = async () => {
    try {
      const res = await getCitas();
      res.sort((a, b) => {
        if (a.fecha === b.fecha) return a.comenzar.localeCompare(b.comenzar);
        return new Date(a.fecha) - new Date(b.fecha);
      });
      setCitas(res);
      const agrupadas = {};
      res.forEach((cita) => {
        const fecha = new Date(cita.fecha);
        const dia = fecha.toISOString().split("T")[0];
        if (!agrupadas[dia]) agrupadas[dia] = [];
        agrupadas[dia].push(cita);
      });
      setEventos(agrupadas);
    } catch (err) {
      console.error("Error al obtener citas", err);
    }
  };

  const handleAddCita = async (e) => {
    e.preventDefault();
    try {
      const nuevaCita = await createCita(formData);
      setCitas((prev) => [...prev, nuevaCita]);
      setModalCrearCita(false);
      setEventos((prev) => {
        const fechaKey = nuevaCita.fecha;
        const citasDelDia = prev[fechaKey] ? [...prev[fechaKey]] : [];
        return {
          ...prev,
          [fechaKey]: [...citasDelDia, nuevaCita],
        };
      });
      toast.success("Se creó correctamente la cita");
    } catch (error) {
      console.error(
        "Error al crear la cita",
        error.response?.data || error.message
      );
      toast.error("Error al crear la cita");
    }
  };
  function isSolapado(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
  }

  const calcularCeldasOcupadas = () => {
    const celdas = {};
    Object.entries(eventos).forEach(([fechaStr, citasDia]) => {
      citasDia.forEach((cita) => {
        const [h1, m1] = cita.comenzar.split(":").map(Number);
        const [h2, m2] = cita.finalizar.split(":").map(Number);
        for (let min = h1 * 60 + m1; min < h2 * 60 + m2; min += 15) {
          const horas = Math.floor(min / 60);
          const minutos = min % 60;
          const timeStr = `${horas.toString().padStart(2, "0")}:${minutos
            .toString()
            .padStart(2, "0")}`;
          const key = `${fechaStr}-${timeStr}`;
          celdas[key] = true;
        }
      });
    });
    return celdas;
  };

  const celdasOcupadas = calcularCeldasOcupadas();

  const renderCelda = (diaIndex, horaStr) => {
    const fecha = getFechaConHora(diaIndex, horaStr);
    const fechaStr = fecha.toISOString().split("T")[0];
    const key = `${fechaStr}-${horaStr}`;
    const citasDia = eventos[fechaStr] || [];
    const [hora, minuto] = horaStr.split(":").map(Number);
    const inicioCeldaMin = hora * 60 + minuto;

    const celdaBase = (
      <div
        key={key}
        className="relative bg-zinc-100 border border-zinc-600 h-16 hover:bg-zinc-400 cursor-pointer"
        onClick={() => {
          const comenzar = new Date(fecha);
          const finalizar = new Date(fecha);
          finalizar.setMinutes(finalizar.getMinutes() + 30);
          setFormData({
            ...initialCitaState,
            fecha: fechaStr,
            comenzar: `${comenzar
              .getHours()
              .toString()
              .padStart(2, "0")}:${comenzar
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
          });
          setModalCrearCita(true);
        }}
      ></div>
    );

    // Buscar citas que empiezan exactamente en esta celda
    const citasEnEsteMinuto = citasDia.filter((cita) => {
      const [h, m] = cita.comenzar.split(":").map(Number);
      const citaInicioMin = h * 60 + m;
      return citaInicioMin === inicioCeldaMin;
    });

    if (citasEnEsteMinuto.length > 0) {
      return (
        <div key={key} className="relative h-16">
          {celdaBase}
          {citasEnEsteMinuto.map((cita, index) => {
            const [h1, m1] = cita.comenzar.split(":").map(Number);
            const [h2, m2] = cita.finalizar.split(":").map(Number);
            const inicioCitaMin = h1 * 60 + m1;
            const finCitaMin = h2 * 60 + m2;
            const duracion = finCitaMin - inicioCitaMin;
            const alturaPorMinuto = 64 / 60;

            return (
              <div
                key={cita.id}
                className="absolute bg-zinc-400 hover:bg-zinc-600 left-0 right-0 z-10 px-2 py-1 text-white text-sm shadow-md cursor-pointer rounded-md"
                style={{
                  top: 0,
                  height: `${duracion * alturaPorMinuto}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCitaSeleccionada(cita);
                  setFormData({
                    id: cita.id,
                    patient_id: cita.paciente_id,
                    fecha: cita.fecha,
                    comenzar: cita.comenzar,
                    finalizar: cita.finalizar,
                    descripcion: cita.descripcion,
                    precio: cita.precio,
                    metodo_pago: cita.metodo_pago,
                  });
                  setModalEditarCita(true);
                }}
                title={`Paciente: ${cita.paciente || "Sin nombre"}\nHora: ${
                  cita.comenzar
                } - ${cita.finalizar}\nDescripción: ${
                  cita.descripcion || "Sin descripción"
                }`}
              >
                <p className="font-bold text-sm truncate mb-1">
                  {cita.paciente_nombre || "Sin nombre"}
                </p>
                {cita.descripcion && (
                  <>
                    <p className="text-xs truncate text-center mb-1">
                      {cita.descripcion}
                    </p>
                    <p className="text-xs">
                      {cita.comenzar} - {cita.finalizar}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return celdaBase;
  };

  function parseHora(hora) {
    if (typeof hora === "string") return hora;
    if (hora instanceof Date) {
      return (
        hora.getHours().toString().padStart(2, "0") +
        ":" +
        hora.getMinutes().toString().padStart(2, "0")
      );
    }
    return ""; // fallback
  }

  function puedeCrearCita(
    eventos,
    fecha,
    comenzar,
    finalizar,
    idActual = null
  ) {
    const citasDia = eventos[fecha] || [];
    const [h1, m1] = comenzar.split(":").map(Number); // hora de inicio
    const [h2, m2] = parseHora(finalizar).split(":").map(Number); // hora de fin

    // Convertimos a minutos para manejar intervalos más pequeños
    const inicioNuevo = h1 * 60 + m1;
    const finNuevo = h2 * 60 + m2;

    // Verifica si no hay solapamientos
    return !citasDia.some((cita) => {
      if (idActual && cita.id === idActual) return false; // Permite editar la propia cita

      const [ch1, cm1] = cita.comenzar.split(":").map(Number);
      const [ch2, cm2] = cita.finalizar.split(":").map(Number);
      const inicioExistente = ch1 * 60 + cm1;
      const finExistente = ch2 * 60 + cm2;

      // Devuelve true si NO hay solapamientos (con cualquier intervalo)
      return !(finNuevo <= inicioExistente || inicioNuevo >= finExistente);
    });
  }

  const handleSave = async (datosActualizados) => {
    const { fecha, comenzar, finalizar, id } = datosActualizados;
    if (!puedeCrearCita(fecha, comenzar, finalizar, id)) {
      toast.error("La cita se solapa con otra ya existente");
      return;
    }
    // Continúa con la actualización
    try {
      await updateCita(id, datosActualizados);
      setModalEditarCita(false);
      fetchCitas();
      toast.success("Cita actualizada con éxito");
    } catch (error) {
      console.error("Hubo un error al actualizar la cita", error);
      toast.error("La cita NO se actualizó correctamente");
    }
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteCita(formData.id); // Usa 'pk' si corresponde
      toast.success("Cita eliminada correctamente");
      setModalEditarCita(false);
      fetchCitas();
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      toast.error("Error al eliminar la cita");
    }
  };

  return (
    <div className="overflow-auto h-screen rounded-md">
      <div className="button-container rounded-md mr-2">
        <button
          onClick={() =>
            setFechaInicioSemana((prev) => {
              const nueva = new Date(prev);
              nueva.setDate(nueva.getDate() - 7);
              return nueva;
            })
          }
          className="button-flecha-calendar"
        >
          <ChevronLeftIcon className="flecha-calendar" />
        </button>

        <h2 className="texto-calendar">
          Semana del {fechaInicioSemana.toLocaleDateString()}
        </h2>

        <button
          onClick={() =>
            setFechaInicioSemana((prev) => {
              const nueva = new Date(prev);
              nueva.setDate(nueva.getDate() + 7);
              return nueva;
            })
          }
          className="button-flecha-calendar"
        >
          <ChevronRightIcon className="flecha-calendar" />
        </button>
      </div>
      <div className="grid grid-cols-[100px_repeat(7,_1fr)] mr-2 rounded-md">
        {/* Header con días */}
        <div></div>
        {diasSemana.map((dia, index) => {
          const fecha = new Date(fechaInicioSemana);
          fecha.setDate(fecha.getDate() + index);
          const label = `${dia} ${fecha.getDate()}/${fecha.getMonth() + 1}`;

          const isToday = new Date().toDateString() === fecha.toDateString();

          return (
            <div
              key={dia}
              className={`text-center font-semibold py-2 border-b-2 border-zinc-600 rounded-t-md ${
                isToday
                  ? "bg-zinc-600 text-zinc-200"
                  : "bg-zinc-200 text-zinc-600"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Fila por hora */}
      {horas.map((horaStr) => (
        <React.Fragment key={horaStr}>
          <div className="relative grid grid-cols-[100px_repeat(7,_1fr)] min-h-[64px] mr-2">
            {/* Hora visible, alineada arriba */}
            <div className="relative text-right pr-2 pt-1 text-sm bg-zinc-200 text-zinc-600 border-r border-zinc-600">
              {horaStr}

              {/* Muesca para la media hora */}
              <div className="absolute left-0 bottom-0 w-full h-full flex items-center justify-end pr-2 pointer-events-none">
                <div className="w-full border-t border-dashed border-zinc-400 absolute top-1/2 left-0"></div>
              </div>
            </div>

            {/* Celdas del día */}
            {Array.from({ length: 7 }).map((_, diaIndex) => (
              <div key={diaIndex} className="relative border-l border-zinc-300">
                {/* Muesca de media hora */}
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-zinc-300"></div>

                {/* Aquí puedes insertar eventos o renderCelda */}
                {renderCelda(diaIndex, horaStr)}
              </div>
            ))}
          </div>

          {/* Línea inferior divisoria */}
          <div className="grid grid-cols-[100px_repeat(7,_1fr)] min-h-[1px] bg-zinc-600 mr-2">
            <div></div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-zinc-600"></div>
            ))}
          </div>
        </React.Fragment>
      ))}

      {modalCrearCita && (
        <CrearCitaModal
          citas={citas}
          setCitas={setCitas}
          formData={formData}
          setFormData={setFormData}
          isOpen={modalCrearCita}
          firstInputRef={firstInputRef}
        />
      )}
      {modalEditarCita && (
        <EditarCitaModal
          onClose={() => setModalEditarCita(false)}
          isOpen={modalEditarCita}
          formData={formData}
          setFormData={setFormData}
          onChange={handleFormChange}
          onSave={handleSave}
          onDelete={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default VistaSemanaCitas;
