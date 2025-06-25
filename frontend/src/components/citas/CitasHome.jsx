import React, { useEffect, useState } from "react";
import {
  getCitas,
  updateCita,
  deleteCita,
  sendWhatsapp,
} from "../../services/citasService";
import { toast } from "react-toastify";
import ConfirmModal from "../ConfirmModal";

const CitasHoyYManana = () => {
  const [citasHoy, setCitasHoy] = useState([]);
  const [citasManana, setCitasManana] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    paciente_id: "",
    descripcion: "",
    fecha: "",
    comenzar: "",
    finalizar: "",
    precio: "",
    metodo_pago: "",
  });
  const [modalEliminar, setModalEliminar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const todasCitas = await getCitas();
        const hoy = new Date();
        const manana = new Date();
        manana.setDate(hoy.getDate() + 1);

        const citasDeHoy = filterCitasByDate(todasCitas, hoy);
        const citasDeManana = filterCitasByDate(todasCitas, manana);

        setCitasHoy(citasDeHoy);
        setCitasManana(citasDeManana);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener las citas:", error);
        setLoading(false);
        toast.error("Ocurrió un error al cargar las citas");
      }
    };

    fetchCitas();
  }, []);

  const filterCitasByDate = (citas, date) => {
    return citas.filter((cita) => {
      const fechaCita = new Date(`${cita.fecha}T${cita.finalizar}`);
      return fechaCita.toDateString() === date.toDateString();
    });
  };

  const handleSave = async (formData) => {
    try {
      const updatedCita = await updateCita(citaSeleccionada.id, formData);
      updateCitasList(updatedCita);
      setIsEditing(false);
      toast.success("Cita actualizada correctamente");
    } catch (error) {
      console.error("Error al guardar la cita:", error);
      toast.error("Error al actualizar la cita");
    }
  };

  const updateCitasList = (updatedCita) => {
    setCitasHoy((prev) =>
      prev.map((cita) => (cita.id === updatedCita.id ? updatedCita : cita))
    );
    setCitasManana((prev) =>
      prev.map((cita) => (cita.id === updatedCita.id ? updatedCita : cita))
    );
  };

  const handleEdit = (cita) => {
    setCitaSeleccionada(cita);
    setFormData({
      paciente_id: cita.paciente_id,
      descripcion: cita.descripcion,
      fecha: cita.fecha,
      comenzar: cita.comenzar,
      finalizar: cita.finalizar,
      precio: cita.precio,
      metodo_pago: cita.metodo_pago,
    });
    setIsEditing(true);
  };

  const handleEliminarClick = (cita) => {
    setCitaSeleccionada(cita);
    setModalEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await deleteCita(citaSeleccionada.id);
      removeCitaFromList(citaSeleccionada.id);
      toast.success("Cita eliminada correctamente");
    } catch (error) {
      console.error("Hubo un error al eliminar la cita", error);
      toast.error("Ocurrió un error al eliminar la cita");
    } finally {
      setModalEliminar(false);
      setCitaSeleccionada(null);
    }
  };

  const removeCitaFromList = (id) => {
    setCitasHoy((prev) => prev.filter((cita) => cita.id !== id));
    setCitasManana((prev) => prev.filter((cita) => cita.id !== id));
  };

  const handleEnviarWhatsapp = async () => {
    const citasIds = citasManana.map((cita) => cita.id);

    console.log("IDs de citas a enviar:", citasIds); // Asegúrate de que esta variable sea correcta

    if (citasIds.length === 0) {
      toast.error("No hay citas para enviar recordatorio");
      return;
    }

    try {
      setEnviando(true);
      const result = await sendWhatsapp(citasIds);
      toast.success("Mensajes enviados correctamente.");
    } catch (error) {
      console.error("Error al enviar mensajes", error);
      toast.error("Error al enviar mensajes");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return <div className="text-center text-lg">Cargando...</div>;
  }

  return (
    <div className="mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Citas de Hoy */}
        <div className="table-container">
          <h3 className="title-section mb-4">Citas de Hoy</h3>
          <table className="table-pacientes">
            <thead className="thead-pacientes">
              <tr>
                <th className="th-pacientes">Paciente</th>
                <th className="th-pacientes">Hora de Comienzo</th>
                <th className="th-pacientes">Hora de Finalizar</th>
                <th className="th-pacientes">Acciones</th>
              </tr>
            </thead>
            <tbody className="tbody_pacientes">
              {citasHoy.length > 0 ? (
                citasHoy.map((cita, index) => (
                  <tr key={index} className="tbtr-pacientes">
                    <td className="tbodytd-pacientes">
                      {cita.paciente_nombre}
                    </td>
                    <td className="tbodytd-pacientes">
                      {new Date(
                        `${cita.fecha}T${cita.comenzar}`
                      ).toLocaleTimeString()}
                    </td>
                    <td className="tbodytd-pacientes">
                      {new Date(
                        `${cita.fecha}T${cita.finalizar}`
                      ).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="btn-actions-container">
                        <button
                          className="btn-toogle"
                          onClick={() => handleEdit(cita)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-toogle"
                          onClick={() => handleEliminarClick(cita)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 px-4 text-center">
                    No hay citas para hoy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Citas de Mañana */}
        <div className="table-container">
          <h3 className="title-section mb-4">Citas de Mañana</h3>
          <table className="table-pacientes">
            <thead className="thead-pacientes">
              <tr>
                <th className="th-pacientes">Paciente</th>
                <th className="th-pacientes">Hora de Comienzo</th>
                <th className="th-pacientes">Hora de Finalizar</th>
                <th className="th-pacientes">Acciones</th>
              </tr>
            </thead>
            <tbody className="tbody_pacientes">
              {citasManana.length > 0 ? (
                citasManana.map((cita, index) => (
                  <tr key={index} className="tbtr-pacientes">
                    <td className="tbodytd-pacientes">
                      {cita.paciente_nombre}
                    </td>
                    <td className="tbodytd-pacientes">
                      {new Date(
                        `${cita.fecha}T${cita.comenzar}`
                      ).toLocaleTimeString()}
                    </td>
                    <td className="tbodytd-pacientes">
                      {new Date(
                        `${cita.fecha}T${cita.finalizar}`
                      ).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="btn-actions-container">
                        <button
                          className="btn-toogle"
                          onClick={() => handleEdit(cita)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-toogle"
                          onClick={() => handleEliminarClick(cita)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 px-4 text-center">
                    No hay citas para mañana.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            className="btn-toogle"
            onClick={handleEnviarWhatsapp}
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar WhatsApp a pacientes de mañana"}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        onConfirm={handleConfirmarEliminar}
        message="¿Estás seguro de que deseas eliminar esta cita?"
      />
    </div>
  );
};

export default CitasHoyYManana;
