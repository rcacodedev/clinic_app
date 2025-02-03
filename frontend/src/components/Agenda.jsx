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
    const getStartOfWeek = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Ajusta al lunes
        startOfWeek.setDate(startOfWeek.getDate() + diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    };

    const generateWeek = (startDate) => {
        return Array.from({ length: 7 }, (_, i) => {
            const newDate = new Date(startDate);
            newDate.setDate(startDate.getDate() + i);
            return newDate;
        });
    };

    const changeWeek = (direction) => {
        const newStartDate = new Date(currentWeek[0]); // Tomar el lunes actual
        newStartDate.setDate(newStartDate.getDate() + direction * 7); // Avanzar o retroceder 7 días
        const newWeek = generateWeek(newStartDate);
        setCurrentWeek(newWeek); // Actualiza el estado de la semana
    };

    const findCita = (date, hour) => {
        return citas.filter((cita) => {
            const citaDate = new Date(cita.fecha).toDateString();
            const slotDate = date.toDateString();
            const citaStartHour = parseInt(cita.comenzar.split(':')[0], 10);
            const citaEndHour = parseInt(cita.finalizar.split(':')[0], 10);

            return citaDate === slotDate && citaStartHour <= hour && hour < citaEndHour;
        });
    };

    const handleClick = (cita) => {
        setSelectedCita(cita);
        openModal(cita);
    };

    const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
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
                        <th colSpan={8} className="agenda-header-month">
                            {currentMonth}
                        </th>
                    </tr>
                    <tr>
                        <th className="agenda-header-hour">Hora</th>
                        {currentWeek.map((date) => (
                            <th
                                key={date.toDateString()}
                                className={`agenda-header-day ${
                                    today === date.toDateString() ? 'agenda-today' : ''
                                }`}
                            >
                                {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {hours.map((hour) => (
                        <tr key={hour} className="agenda-row">
                            <td className="agenda-hour-cell">{`${hour}:00`}</td>
                            {currentWeek.map((date) => {
                                const citasInSlot = findCita(date, hour);
                                const isToday = today === date.toDateString();
                                return (
                                    <td
                                        key={`${date.toDateString()}-${hour}`}
                                        className={`agenda-slot ${
                                            isToday ? 'agenda-slot-today' : ''
                                        }`}
                                        onClick={() =>
                                            citasInSlot.length > 0 && handleClick(citasInSlot[0])
                                        }
                                    >
                                        {citasInSlot.map((cita) => (
                                            <div
                                                className="agenda-cita"
                                                key={cita.id}
                                                onClick={() => handleClick(cita)}
                                            >
                                                <strong>{cita.patient_name} {cita.patient_primer_apellido}</strong>
                                                <p>{cita.descripcion}</p>
                                            </div>
                                        ))}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <CustomModal
                isOpen={modalVisible}
                onRequestClose={closeModal}
                title="Editar o Eliminar Cita"
            >
                {selectedCita ? (
                    <div className="modal-body">
                        <h3>Paciente: {selectedCita.patient_name}</h3>
                        <p>{selectedCita.descripcion}</p>
                        <div className="modal-actions">
                            <button
                                className="modal-save"
                                onClick={() => console.log('Editando...')}
                            >
                                Editar
                            </button>
                            <button
                                className="modal-cancel"
                                onClick={() => console.log('Eliminando...')}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>Cargando información de la cita...</p>
                )}
            </CustomModal>
        </div>
    );
};

export default Agenda;
