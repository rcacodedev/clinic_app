import React, { useState } from "react";
import CustomModal from "../Modal";
import Boton from "../Boton";

const PrecioModal = ({ cita, isOpen, onClose, onSave }) => {
    if (!cita) return null; // evita error

    const [precio, setPrecio] = useState(cita.precio || "");

    const handleSave = () => {
        onSave(cita.id, precio);
        onClose();
    };

    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onClose}
            title="Asignar Precio a la Cita"
        >
            <div className="flex flex-col gap-4">
                <label className="text-gray-700 font-semibold">Precio:</label>
                <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Introduce el precio"
                    min="0"
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end">
                    <Boton texto="Guardar" tipo="guardar" onClick={handleSave} />
                </div>
            </div>
        </CustomModal>
    );
};

export default PrecioModal;
