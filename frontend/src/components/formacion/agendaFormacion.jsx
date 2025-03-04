import React, { useState, useEffect } from "react";
import { updateFormacion, deleteFormacion } from "../../services/formacionService";
import Boton from "../Boton";
import CustomModal from "../Modal";
import '../../styles/formacion/agendaFormacion.css'

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
        fecha: '',
        hora: '',
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);


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

    // Funcion para asociar las formaciones a los días correspondientes
    const associteFormacionestoDays = () => {
        const updateDays = generateCalendarDays(month, year).map(dayObj => {
            if (!dayObj) return null; // Mantener los días vacíos

            // Convertimos la fecha a UTC eliminando la diferencia horaria
            const formattedDate = dayObj.date.toISOString().split('T')[0]; // "YYYY-MM-DD"

            // Asegurar que la fecha de la formación se compara correctamente
            const formacionesDia = Array.isArray(formaciones)
                ? formaciones.filter(f => new Date(f.fecha + "T00:00:00").toISOString().split('T')[0] === formattedDate)
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
            fecha: formacion.fecha,
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
    }

    return (
        <div className="agenda-container">
            <div className="calendar-header">
                <Boton texto="Año Anterior" onClick={() => setYear(year - 1)}  />
                <Boton texto="Mes Anterior" onClick={() => setMonth(month - 1)} disabled={month === 0 ? true : false} />
                <h2>{new Date(year, month).toLocaleString("es-ES", { month: "long", year: "numeric"})}</h2>
                <Boton texto="Mes Siguiente" onClick={() => setMonth(month + 1)} disabled={month === 11 ? true : false} />
                <Boton texto="Año Siguiente" onClick={() => setYear(year + 1)} />
            </div>

            <div className="weekdays">
                {diasSemana.map((dia, index) => (
                    <div key={index} className="weekday">
                        {dia}
                    </div>
                ))}
            </div>

            <div className="calendar-grid">
                {days.map((dayObj, index) => (
                    <div key={index} className={`calendar-day ${dayObj ? "" : "empty"}`}>
                        {dayObj && (
                            <>
                                <span className="day-number">{dayObj.date.getDate()}</span>
                                {dayObj.formaciones.length > 0 && (
                                    <div className="formaciones-list">
                                        {dayObj.formaciones.map((formacion, i) => (
                                            <div key={i} className="formacion-item" onClick={() => handleOpenModal(formacion)}>
                                                <strong>{formacion.titulo}</strong>
                                                <p>{formacion.lugar}</p>
                                                <p>{formacion.hora}</p>
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
                        {text: "Guardar Cambios", onClick: handleUpdate, className: "guardar"},
                        {text: "Eliminar", onClick: handleDeleteClick, className: "peligro"},
                    ]}
                    >
                    <div className="modal-content">
                        <label>Título:</label>
                        <input type="text" value={formacionData.titulo} onChange={(e) => setFormacionData({...formacionData, titulo: e.target.value})} />
                        <label>Profesional:</label>
                        <input type="text" value={formacionData.profesional} onChange={(e) => setFormacionData({...formacionData, profesional: e.target.value})} />
                        <label>Lugar:</label>
                        <input type="text" value={formacionData.lugar} onChange={(e) => setFormacionData({...formacionData, lugar: e.target.value})} />
                        <label>Temática:</label>
                        <input type="text" value={formacionData.tematica} onChange={(e) => setFormacionData({...formacionData, tematica: e.target.value})} />
                        <label>Fecha:</label>
                        <input type="date" value={formacionData.fecha} onChange={(e) => setFormacionData({...formacionData, fecha: e.target.value})} />
                        <label>Hora:</label>
                        <input type="time" value={formacionData.hora} onChange={(e) => setFormacionData({...formacionData, hora: e.target.value})} />
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
        </div>
    );
};

export default AgendaFormacion;