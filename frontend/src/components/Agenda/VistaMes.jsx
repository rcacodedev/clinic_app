import React, { useState, useEffect, useRef } from "react";
import CrearFormacionModal from "../formacion/CrearFormacionModal";
import {
  getFormacion,
  createFormacion,
  updateFormacion,
  deleteFormacion,
} from "../../services/formacionService";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { toast } from "react-toastify";
import EditarFormacionModal from "../formacion/EditarFormacionModal";
import ConfirmModal from "../ConfirmModal";
const initialFormacionData = {
  titulo: "",
  profesional: "",
  lugar: "",
  tematica: "",
  fecha_inicio: "",
  fecha_fin: "",
  hora: "",
};

const VistaMes = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [formaciones, setFormaciones] = useState([]);
  const [formData, setFormData] = useState(initialFormacionData);
  const [eventos, setEventos] = useState({});
  const [modalOpenFormacion, setModalOpenFormacion] = useState(false);
  const [modalEditarFormacion, setModalEditarFormacion] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formacionToDelete, setFormacionToDelete] = useState(null);
  const firstInputRef = useRef();

  const ano = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  // Nombre del mes y días de la semana
  const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const nombreMes = capitalizar(
    fechaActual.toLocaleString("es-ES", { month: "long" })
  );
  const diasSemana = ["Lun", "Mar", "Miér", "Jue", "Vie", "Sáb", "Dom"];

  // Calcular número de días del mes
  const diasMes = new Date(ano, mes + 1, 0).getDate();
  // Día de la semana del primer día (0 = domingo, 1 = lunes, ...)
  let primerDia = new Date(ano, mes, 1).getDay();
  primerDia = primerDia === 0 ? 6 : primerDia - 1;
  // Crear array de celdas (vacías + días)
  const celdasCalendario = [];
  for (let i = 0; i < primerDia; i++) {
    celdasCalendario.push(null);
  }
  for (let i = 1; i <= diasMes; i++) {
    celdasCalendario.push(i);
  }
  // Dividir en semanas (filas)
  const semanas = [];
  for (let i = 0; i < celdasCalendario.length; i += 7) {
    semanas.push(celdasCalendario.slice(i, i + 7));
  }

  // Ir al mes anterior
  const navegarMesAnterior = () => {
    const prev = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() - 1,
      1
    );
    setFechaActual(prev);
  };

  // Ir al mes siguiente
  const navegarMesSiguiente = () => {
    const next = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() + 1,
      1
    );
    setFechaActual(next);
  };

  const esHoy = (dia) => {
    const hoy = new Date();
    return (
      dia &&
      hoy.getDate() === dia &&
      hoy.getMonth() === mes &&
      hoy.getFullYear() === ano
    );
  };

  const formatDateKey = (day) => {
    if (!day) return null;
    const date = new Date(ano, mes, day);
    // Formato YYYY-MM-DD sin desfase de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayFormatted = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${dayFormatted}`;
  };

  // Gestionar modales
  const openModalCreate = (day) => {
    const dateKey = formatDateKey(day);
    setFechaSeleccionada(dateKey);
    setFormData({
      ...initialFormacionData,
      fecha_inicio: dateKey,
    });
    setModalOpenFormacion(true);
  };

  const openModalEdit = (formacionItem) => {
    setFormData(formacionItem);
    setModalEditarFormacion(true);
  };

  // Obtener formaciones al cargar el componente
  const fetchFormaciones = async () => {
    try {
      const response = await getFormacion();
      setFormaciones(response.results);
    } catch (error) {
      console.error("Error al obtener las formaciones", error);
      toast.error("Hubo un error al cargar las formaciones");
    }
  };
  useEffect(() => {
    fetchFormaciones();
    const agrupadas = {};

    formaciones.forEach((formacion) => {
      const start = new Date(formacion.fecha_inicio);
      const end = new Date(formacion.fecha_fin);

      // Iterar desde start hasta end
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const fechaStr = `${year}-${month}-${day}`;

        if (!agrupadas[fechaStr]) {
          agrupadas[fechaStr] = [];
        }
        agrupadas[fechaStr].push(formacion);
      }
    });

    setEventos(agrupadas);
  }, [formaciones]);

  // Función para manejar los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Funcion para guardar la formación
  const handleSaveFormacion = async () => {
    try {
      const response = await createFormacion(formData);
      setFormaciones([...formaciones, response]);
      setModalOpenFormacion(false);
      toast.success("Se creó correctamente la formación");
    } catch (error) {
      console.error("Error al crear la formación:", error);
      toast.error("Hubo un error al crear la formación");
    }
  };

  const handleEditFormacion = async (formacion) => {
    try {
      await updateFormacion(formacion.id, formacion);
      setModalEditarFormacion(false);
      toast.success("Formación actualizada con éxito");
      fetchFormaciones();
    } catch (error) {
      console.error("Hubo un error al actualizar la formación", error);
      toast.error("Hubo un error al actualizar la Formación");
    }
  };

  // Confirmar la eliminación
  const confirmDelete = async () => {
    if (!formacionToDelete) return;
    try {
      await deleteFormacion(formacionToDelete.id);
      setFormaciones(formaciones.filter((f) => f.id !== formacionToDelete.id));
      toast.success("Formación eliminada correctamente");
      fetchFormaciones();
    } catch (error) {
      console.error("Hubo un error al eliminar la formación", error);
      toast.error("Hubo un error al eliminar la formación");
    } finally {
      closeConfirmModal();
    }
  };
  // Función para abrir el confirm modal para eliminar
  const openConfirmModal = (formacion) => {
    setFormacionToDelete(formacion);
    setConfirmModalOpen(true);
  };

  // Función para cerrar el confirm modal
  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setFormacionToDelete(null);
  };

  return (
    <div className="mes-container">
      <div className="button-container">
        <button
          onClick={navegarMesAnterior}
          className="button-flecha-calendar"
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon className="flecha-calendar" />
        </button>

        <h2 className="texto-calendar">
          {nombreMes} {ano}
        </h2>

        <button
          onClick={navegarMesSiguiente}
          className="button-flecha-calendar"
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon className="flecha-calendar" />
        </button>
      </div>
      {/* Días de la semana */}
      <div className="label-calendar-mes">
        {diasSemana.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-rows-6 grid-cols-7 gap-1 mt-4 text-sm">
        {semanas.map((week, wi) =>
          week.map((day, di) => {
            const dateKey = formatDateKey(day);
            const formacionesDelDia = eventos[dateKey] || [];

            return (
              <div
                key={`${wi}-${di}`}
                className={`h-20 border rounded-lg p-1 text-left transition-all duration-150 overflow-auto
                  ${
                    esHoy(day)
                      ? "bg-zinc-500 border-zinc-700 font-bold  text-white"
                      : "border-zinc-800  text-zinc-900 m-1"
                  }
                  ${
                    day
                      ? "cursor-pointer hover:bg-zinc-800 hover:text-slate-200"
                      : ""
                  }
                `}
                onClick={() => day && openModalCreate(day)}
              >
                {day && <div className="font-bold text-sm">{day}</div>}

                {formacionesDelDia.map((formacion) => (
                  <div
                    key={formacion.id}
                    className="flex justify-between items-center border-tan border-2 rounded px-1 py-0.5 my-0.5 bg-zinc-500 text-xs"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openModalEdit(formacion);
                      }}
                      className="flex-1 truncate cursor-pointer hover:bg-zinc-800 px-1 py-0.5 rounded"
                    >
                      <span className="text-gray-600 dark:text-gray-300 mr-1">
                        {formacion.hora?.slice(0, 5)}
                      </span>
                      <span className="mr-1">-</span> {/* separador */}
                      <span className="font-semibold truncate">
                        {formacion.titulo}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmModal(formacion);
                      }}
                      className="ml-1 text-lg text-red-700 hover:text-red-900"
                      title="Eliminar formación"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Modales Crear y Editar */}
      {modalOpenFormacion && (
        <CrearFormacionModal
          onClose={() => setModalOpenFormacion(false)}
          onSubmit={handleSaveFormacion}
          formData={formData}
          setFormData={setFormData}
          onChange={handleChange}
          isOpen={modalOpenFormacion}
          firstInputRef={firstInputRef}
        />
      )}
      {modalEditarFormacion && formData && (
        <EditarFormacionModal
          isOpen={modalEditarFormacion}
          formData={formData}
          setFormData={setFormData}
          onChange={handleChange}
          onSave={handleEditFormacion}
          onClose={() => setModalEditarFormacion(false)}
        />
      )}

      {/* Confirm Modal para eliminar */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        message="¿Estás seguro de que deseas eliminar esta formación?"
      />
    </div>
  );
};

export default VistaMes;
