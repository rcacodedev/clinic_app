import React, { useState, useEffect } from "react";
import Boton from "../Boton";
import CustomModal from "../Modal";

const EditarNotaModal = ({ isOpen, onClose, onSave, note }) => {
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [color, setColor] = useState("#FFEE8C");
    const [isImportant, setIsImportant] = useState(false);

    // Cuando se abre el modal, cargar los valores actuales de la nota
    useEffect(() => {
        if (note) {
            setTitulo(note.titulo);
            setContenido(note.contenido);
            setReminderDate(note.reminder_date ? new Date(note.reminder_date).toISOString().split('T')[0] : ""); // Formato adecuado
            setColor(note.color || "#FFEE8C");
            setIsImportant(note.is_important || false);
        }
    }, [note]);

    // Función para manejar la actualización de la nota
    const handleSave = () => {
        if (!titulo.trim() || !contenido.trim()) {
            alert("El título y contenido no pueden estar vacíos.");
            return;
        }

        const updatedNote = {
            ...note,
            titulo,
            contenido,
            reminder_date: reminderDate,
            color,
            is_important: isImportant,
        };

        // Enviar los datos actualizados al padre
        onSave(updatedNote);

        // Cerrar el modal
        onClose();
    };

    // No mostrar el modal si no está abierto
    if (!isOpen) return null;
    console.log('Modal abierto para editar', note); // Verifica que el modal se esté abriendo con los datos correctos

    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onClose}
            title="Editar Nota"
        >
            <div className="form-group">
                <label>Título:</label>
                <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título"
                />
            </div>

            <div className="form-group">
                <label>Contenido:</label>
                <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Contenido"
                />
            </div>

            <div className="form-group">
                <label>Fecha de recordatorio:</label>
                <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Color:</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Importante:</label>
                <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                />
            </div>
            <Boton onClick={handleSave} texto="Guardar Nota" tipo="guardar" />
        </CustomModal>
    );
};

export default EditarNotaModal;
