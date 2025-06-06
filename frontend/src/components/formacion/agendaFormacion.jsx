import React, { useState, useEffect } from "react";
import { updateFormacion, deleteFormacion } from "../../services/formacionService";
import { FaUser, FaMapMarkerAlt, FaBook, FaClock, FaRegEdit } from "react-icons/fa"
import Boton from "../Boton";
import CustomModal from "../Modal";
import Notification from "../Notification";


const AgendaFormacion = ({ formaciones, fetchFormaciones }) => {
    const today = new Date()
    // Estados para controlar el mes y el año
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    // Estado para almacenar los dias del mes
    const [days, setDays] = useState([]);
    // Variable para mostrar los dias de la semana
    const diasSemana = ["Lun", "Mar", "Miér", "Jue", "Vie", "Sáb", "Dom"];
    // Variables para modal de edicion y eliminacion
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFormacion, setSelectedFormacion] = useState(null);
    const [formacionData, setFormacionData] = useState({
        titulo: '',
        profesional: '',
        lugar: '',
        tematica: '',
        fecha_inicio: '',
        fecha_fin: '',
        hora: '',
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [notificationVisibleEliminar, setNotificationVisibleEliminar] = useState(false)

    // Obtener los dias del mes alineados con los dias de la semana
    const generateCalendarDays = (month, year) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Agregar días vacíos hasta el primer día del mes
        let emptyDays = (firstDay.getDay() + 6) % 7; // Ajustar inicio para que la semana comience en lunes
        for (let i = 0; i < emptyDays; i++) {
            days.push(null);
        }

        // Llenar los días del mes con las formaciones
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                formaciones: [],
            });
        }

        return days;
    };

    const getDaysInRange = (startDate, endDate) => {
        const days = [];
        let currentDate = new Date(startDate);

        // Iterar desde la fecha de inicio hasta la fecha de finalización
        while (currentDate <= endDate) {
            days.push(new Date(currentDate)); // Añadir el día actual
            currentDate.setDate(currentDate.getDate() + 1); // Avanzar un día
        }

        return days;
    };


    // Funcion para asociar las formaciones a los días correspondientes
    const associteFormacionestoDays = () => {
        const updateDays = generateCalendarDays(month, year).map(dayObj => {
            if (!dayObj) return null; // Mantener los días vacíos

            // Convertimos la fecha a UTC eliminando la diferencia horaria
            const formattedDate = dayObj.date.toISOString().split('T')[0]; // "YYYY-MM-DD"

            // Asegurar que la fecha de la formación se compara correctamente
            const formacionesDia = Array.isArray(formaciones)
                ? formaciones.filter(f => {
                    const startDate = new Date(f.fecha_inicio + "T00:00:00");
                    const endDate = new Date(f.fecha_fin + "T23:59:59");

                    // Obtener los días entre la fecha de inicio y la de finalización
                    const formacionDays = getDaysInRange(startDate, endDate);
                    // Verificar si la fecha del día actual está en el rango de la formación
                    return formacionDays.some(day => day.toISOString().split('T')[0] === formattedDate);
                })
                : [];

            return { ...dayObj, formaciones: formacionesDia };
        });

        setDays(updateDays);
    };


    // Asignar las formaciones cuando cambian los datos o la fecha
    useEffect(() => {
        associteFormacionestoDays();
    }, [formaciones, month, year]);

    // Funcion para abrir modal edición
    const handleOpenModal = (formacion) => {
        setSelectedFormacion(formacion);
        setFormacionData({
            titulo: formacion.titulo,
            profesional: formacion.profesional,
            lugar: formacion.lugar,
            tematica: formacion.tematica,
            fecha_inicio: formacion.fecha_inicio,
            fecha_fin: formacion.fecha_fin,
            hora: formacion.hora,
        });
        setModalOpen(true);
    }

    // Funcion para cerrar el modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedFormacion(null);
    }

    // Funcion para actualizar formacion
    const handleUpdate = async () => {
        if (!selectedFormacion) return;
        await updateFormacion(selectedFormacion.id, formacionData);
        fetchFormaciones();
        setModalOpen(false);
    }

    // Funciones para eliminar una formacion
    const handleDeleteClick = () => {
        setConfirmDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedFormacion) return;
        await deleteFormacion(selectedFormacion.id);
        fetchFormaciones();
        setConfirmDeleteOpen(false);
        setModalOpen(false);
        setNotificationVisibleEliminar(true);
    }

    return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                  <Boton texto="Año Anterior" onClick={() => setYear(year - 1)} />
                  <Boton texto="Mes Anterior" onClick={() => setMonth(month - 1)} disabled={month === 0} />
                  <h2 className="text-xl font-semibold text-center w-full sm:w-auto">
                    {new Date(year, month).toLocaleString("es-ES", { month: "long", year: "numeric" })}
                  </h2>
                  <Boton texto="Mes Siguiente" onClick={() => setMonth(month + 1)} disabled={month === 11} />
                  <Boton texto="Año Siguiente" onClick={() => setYear(year + 1)} />
                </div>

                <div className="grid grid-cols-7 text-center font-medium mb-2">
                  {diasSemana.map((dia, index) => (
                    <div key={index} className="py-2 border-b">
                      {dia}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((dayObj, index) => (
                    <div
                      key={index}
                      className={`min-h-[120px] border rounded-lg p-2 flex flex-col justify-start ${
                        dayObj ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      {dayObj && (
                        <>
                          <span className="text-sm font-semibold text-gray-700">{dayObj.date.getDate()}</span>

                          {dayObj.formaciones.length > 0 && (
                            <div className="mt-2 flex flex-col gap-2">
                              {dayObj.formaciones.map((formacion, i) => (
                                <div
                                  key={i}
                                  onClick={() => handleOpenModal(formacion)}
                                  className="w-full bg-blue-100 hover:bg-blue-200 cursor-pointer p-2 rounded-lg shadow transition duration-200"
                                >
                                  <p className="font-semibold text-sm text-blue-900 truncate">{formacion.titulo}</p>
                                  <p className="text-xs text-gray-700">{formacion.lugar}</p>
                                  <p className="text-xs text-gray-600">{formacion.hora}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>


                {modalOpen && (
                    <CustomModal
                          isOpen={modalOpen}
                          onRequestClose={handleCloseModal}
                          title="Editar o Eliminar Formación"
                          actions={[
                            {
                              text: "Guardar Cambios",
                              onClick: handleUpdate,
                              className:
                                "inline-block bg-green-600 text-white px-4 py-2 rounded shadow font-semibold hover:bg-green-700 z-10 border border-green-700"
                            },
                            {
                              text: "Eliminar",
                              onClick: handleDeleteClick,
                              className:
                                "inline-block bg-red-600 text-white px-4 py-2 rounded shadow font-semibold hover:bg-red-700 z-10 border border-red-700"
                            },
                          ]}
                        >
                        <div className="space-y-4">
                          <div>
                            <label className="block font-medium mb-1">Título:</label>
                            <div className="relative">
                              <FaRegEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <input
                                type="text"
                                value={formacionData.titulo}
                                onChange={(e) => setFormacionData({ ...formacionData, titulo: e.target.value })}
                                className="w-full pl-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-medium mb-1">Profesional:</label>
                            <div className="relative">
                              <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <input
                                type="text"
                                value={formacionData.profesional}
                                onChange={(e) => setFormacionData({ ...formacionData, profesional: e.target.value })}
                                className="w-full pl-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-medium mb-1">Lugar:</label>
                            <div className="relative">
                              <FaMapMarkerAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <input
                                type="text"
                                value={formacionData.lugar}
                                onChange={(e) => setFormacionData({ ...formacionData, lugar: e.target.value })}
                                className="w-full pl-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-medium mb-1">Temática:</label>
                            <div className="relative">
                              <FaBook className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <input
                                type="text"
                                value={formacionData.tematica}
                                onChange={(e) => setFormacionData({ ...formacionData, tematica: e.target.value })}
                                className="w-full pl-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-medium mb-1">Fecha de Inicio:</label>
                            <div className="relative">
                              <input
                                type="date"
                                value={formacionData.fecha_inicio}
                                onChange={(e) => setFormacionData({ ...formacionData, fecha_inicio: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-medium mb-1">Fecha de Finalización:</label>
                            <div className="relative">

                              <input
                                type="date"
                                value={formacionData.fecha_fin}
                                onChange={(e) => setFormacionData({ ...formacionData, fecha_fin: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-medium mb-1">Hora:</label>
                            <div className="relative">
                              <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <input
                                type="time"
                                step="60"  // Solo minutos (sin segundos)
                                value={formacionData.hora}
                                onChange={(e) => setFormacionData({ ...formacionData, hora: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                    </CustomModal>
                )}

                {confirmDeleteOpen && (
                    <CustomModal
                        isOpen={confirmDeleteOpen}
                        onRequestClose={() => setConfirmDeleteOpen(false)}
                        title="Confirmar Eliminación de Formación"
                        actions={[
                            { text: "Eliminar", onClick: handleDelete, className: "peligro"},
                        ]}
                        >
                            <p>¿Estás seguro de que quieres eliminar esta formación? Esta acción no se puede deshacer.</p>
                        </CustomModal>
                )}
                <Notification
                    message="Formación eliminada correctamente."
                    isVisible={notificationVisibleEliminar}
                    onClose={() => setNotificationVisibleEliminar(false)}
                    type="error"
                    />
            </div>
        );
};

export default AgendaFormacion;