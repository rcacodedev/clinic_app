import React from 'react';
import CustomModal from './Modal';
import '../styles/agenda.css';

const Agenda = ({
    citas,
    currentWeek,
    setCurrentWeek,
    openModal,
    modalVisible,
    closeModal,
    selectedCita,
    setSelectedCita,
}) => {

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

    const findCita = (date, hour, minute) => {
        return citas.filter((cita) => {
            const citaFecha = new Date(cita.fecha);
            const [startHour, startMinute] = cita.comenzar.split(":").map(Number);
            const [endHour, endMinute] = cita.finalizar.split(":").map(Number);

            const citaStartDate = new Date(citaFecha);
            const citaEndDate = new Date(citaFecha);

            citaStartDate.setHours(startHour, startMinute, 0);
            citaEndDate.setHours(endHour, endMinute, 0);

            const slotDate = new Date(date);
            slotDate.setHours(hour, minute, 0, 0);

            return citaStartDate.getTime() <= slotDate.getTime() && slotDate.getTime() < citaEndDate.getTime();
        });
    };

    const handleClick = (cita) => {
        setSelectedCita(cita);
        openModal(cita);
    };

    const handleSlotClick = (date, hour, minute) => {
        setSelectedCita(null);
        const formattedDate = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
        const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const newCita = {
            fecha: formattedDate,
            comenzar: formattedTime,
            finalizar: '',
            patient_name: '',
            patient_primer_apellido: '',
            descripcion: ''
        };

        setSelectedCita(newCita);
        openModal(newCita);
    };

    // Obtener duracion de las citas
    const getCitaDurationInSlots = (cita) => {
        const [startHour, startMinutes] = cita.comenzar.split(':').map(Number);
        const [endHour, endMinutes] = cita.finalizar.split(':').map(Number);

        const startTime = startHour * 60 + startMinutes;
        const endTime = endHour * 60 + endMinutes;

        return (endTime - startTime) / 15; // Número de intervalos de 15 min
    };

    const hours = Array.from({ length: 57 }, (_, i) => {
        const hour = Math.floor(i / 4) + 8;
        const minute = (i % 4) * 15;
        return { hour, minute };
    });

    const today = new Date().toDateString();
    const currentMonth =
        currentWeek && currentWeek.length > 0
            ? currentWeek[0].toLocaleDateString('es-ES', { month: 'long' })
            : 'Mes desconocido';

    return (
        <div className="agenda-container">
            <h1>Agenda de Citas</h1>
            <div className="agenda-controls">
                <button onClick={() => changeWeek(-1)}>Semana Anterior</button>
                <button onClick={() => changeWeek(1)}>Semana Siguiente</button>
            </div>
            <table className="agenda-table">
                <thead>
                    <tr>
                        <th colSpan={8} className="agenda-header-month">{currentMonth}</th>
                    </tr>
                    <tr>
                        <th className="agenda-header-hour">Hora</th>
                        {currentWeek.map((date) => (
                            <th
                                key={date.toISOString()}
                                className={`agenda-header-day ${today === date.toDateString() ? 'agenda-today' : ''}`}
                            >
                                {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {hours.map(({ hour, minute }) => (
                        <tr key={`${hour}-${minute}`} className="agenda-row">
                            <td className="agenda-hour-cell">{`${hour}:${minute.toString().padStart(2, '0')}`}</td>
                            {currentWeek.map((date) => {
                                const citasInSlot = findCita(date, hour, minute);
                                const isToday = today === date.toDateString();
                                return (
                                    <td
                                        key={`${date.toISOString()}-${hour}-${minute}`}
                                        className={`agenda-slot ${isToday ? 'agenda-slot-today' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (citasInSlot.length > 0) {
                                                handleClick(citasInSlot[0]); // Editar cita existente
                                            } else {
                                                handleSlotClick(date, hour, minute); // Crear nueva cita
                                            }
                                        }}
                                    >
                                        {citasInSlot.map((cita) => {
                                            // Calculamos el número de celdas a ocupar dependiendo de la duración de la cita
                                            const citaStartHour = parseInt(cita.comenzar.split(":")[0], 10);
                                            const citaStartMinute = parseInt(cita.comenzar.split(":")[1], 10);
                                            const citaEndHour = parseInt(cita.finalizar.split(":")[0], 10);
                                            const citaEndMinute = parseInt(cita.finalizar.split(":")[1], 10);

                                            const startCell = (citaStartHour - 8) * 4 + Math.floor(citaStartMinute / 15);
                                            const endCell = (citaEndHour - 8) * 4 + Math.floor(citaEndMinute / 15);

                                            const rowspan = (endCell - startCell); // Número de celdas que ocupa la cita

                                            return (
                                                <div
                                                    key={cita.id}
                                                    className="agenda-cita"
                                                    style={{
                                                        gridRow: `${startCell + 1} / span ${rowspan}`,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClick(cita);
                                                    }}
                                                >
                                                    <strong>{cita.patient_name} {cita.patient_primer_apellido}</strong>
                                                    <p>{cita.descripcion}</p>
                                                </div>
                                            );
                                        })}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <CustomModal isOpen={modalVisible} onRequestClose={closeModal} title={selectedCita ? "Editar Cita" : "Nueva Cita"}>
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
