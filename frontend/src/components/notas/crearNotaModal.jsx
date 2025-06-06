import React, { useState } from "react";

const CrearNotaModal = ({ isOpen, onClose, onSave }) => {
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [color, setColor] = useState("#FFEE8C");
    const [isImportant, setIsImportant] = useState(false);
    const [error, setError] = useState("");

    const handleSave = () => {
        if (titulo.trim() === "" || contenido.trim() === "") {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setError("");
        const formattedReminderDate = reminderDate
            ? new Date(reminderDate).toISOString().split("T")[0]
            : null;

        const nuevaNota = {
            titulo,
            contenido,
            reminder_date: formattedReminderDate,
            color,
            is_important: isImportant,
        };

        onSave(nuevaNota);

        // Resetear los campos
        setTitulo("");
        setContenido("");
        setReminderDate("");
        setColor("#FFEE8C");
        setIsImportant(false);
        onClose();
    };

    if (!isOpen) return null; // No mostrar si no está abierto

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-black dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
                >
                    &times;
                </button>

                <form className="p-6 space-y-4 bg-white" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <h2 className="text-2xl block mb-2 font-bold text-gray-900 dark:text-black">Crear Nota</h2>

                    {/* Título */}
                    <div>
                        <label htmlFor="titulo" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-black">Título</label>
                        <input
                            id="titulo"
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>

                    {/* Contenido */}
                    <div>
                        <label htmlFor="contenido" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-black">Contenido</label>
                        <textarea
                            id="contenido"
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            rows="4"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        ></textarea>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-black">
                        Color
                      </label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 h-12 p-0 border-none cursor-pointer bg-transparent"
                      />
                    </div>

                    {/* Fecha de Recordatorio */}
                    <div>
                        <label htmlFor="reminderDate" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-black">Fecha de Recordatorio</label>
                        <input
                            id="reminderDate"
                            type="date"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>

                    {/* Checkbox de importante */}
                    <div className="flex items-center gap-2">
                        <input
                            id="isImportant"
                            type="checkbox"
                            checked={isImportant}
                            onChange={(e) => setIsImportant(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-600 dark:border-gray-500"
                        />
                        <label htmlFor="isImportant" className="block mb-2 text-sm font-semibold text-gray-900 dark:text-black">Nota Importante</label>
                    </div>

                    {/* Error */}
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    {/* Botón */}
                    <button
                        type="submit"
                        className="w-full text-white bg-negro hover:bg-tan focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        Guardar Nota
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CrearNotaModal;
