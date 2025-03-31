import React, {useState} from "react";
import CustomModal from "../Modal";
import Boton from "../Boton";

const PrecioModal = ({cita, isOpen, onClose, onSave}) => {
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
                <label>Precio:</label>
                <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Introduce el precio"
                    min="0"
                    />
                <Boton texto="Guardar" tipo="guardar" onClick={handleSave}/>
        </CustomModal>
    );
};

export default PrecioModal;
