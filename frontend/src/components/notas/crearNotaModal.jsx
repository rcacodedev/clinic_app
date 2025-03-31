import React, { useState } from "react";
import Boton from "../Boton";
import CustomModal from "../Modal";
import "../../styles/notas/crearnotamodal.css";

const CrearNotaModal = ({ isOpen, onClose, onSave }) => {
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [color, setColor] = useState("#FFEE8C");
    const [isImportant, setIsImportant] = useState(false);
    const [error, setError] = useState(""); // Estado para mensajes de error

    const handleSave = () => {
        if (titulo.trim() === "" || contenido.trim() === "") {
            setError("Todos los campos son obligatorios.");
            return;
        }
        setError(""); // Limpiar error si los datos son válidos

        // Si reminderDate no está vacío, lo convertimos a un objeto Date
        const formattedReminderDate = reminderDate ? new Date(reminderDate).toISOString().split("T")[0] : null;
        console.log("Fecha de recordatorio enviada:", formattedReminderDate);

        const nuevaNota = { titulo, contenido, reminder_date: formattedReminderDate, color, isImportant };
        console.log("Datos enviados al backend:", nuevaNota);

        onSave(nuevaNota);

        // Resetear los campos
        setTitulo("");
        setContenido("");
        setReminderDate("");
        setColor("#FFEE8C");
        setIsImportant(false);
        onClose();
    };


    return (
        <CustomModal isOpen={isOpen} onRequestClose={onClose} title="Crear Nota">
            <div className="crear-nota-form">
                <label htmlFor="titulo">Título</label>
                <input
                    id="titulo"
                    type="text"
                    placeholder="Escribe un título..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    aria-label="Título de la nota"
                />

                <label htmlFor="contenido">Contenido</label>
                <textarea
                    id="contenido"
                    placeholder="Escribe el contenido..."
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    aria-label="Contenido de la nota"
                />

                <label>Color</label>
                <div className="color-picker">
                    {["#f5f5f5", "#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff"].map((col) => (
                        <div
                            key={col}
                            className={`color-circle ${color === col ? "selected" : ""}`}
                            style={{ backgroundColor: col }}
                            onClick={() => setColor(col)}
                            aria-label={`Seleccionar color ${col}`}
                        />
                    ))}
                </div>

                <label htmlFor="reminderDate">Fecha de Recordatorio</label>
                <input
                    id="reminderDate"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                />

                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        id="isImportant"
                        checked={isImportant}
                        onChange={(e) => setIsImportant(e.target.checked)}
                    />
                    <label htmlFor="isImportant">Nota Importante</label>
                </div>

                {error && <p className="error-message">{error}</p>}

                <Boton texto="Guardar Nota" onClick={handleSave} tipo="guardar" />
            </div>
        </CustomModal>
    );
};

export default CrearNotaModal;
