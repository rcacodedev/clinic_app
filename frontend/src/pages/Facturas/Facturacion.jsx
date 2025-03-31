import React, {useState} from "react";
import { setNumeroFactura } from "../../services/facturaService";
import ListFacturas from "../../components/facturacion/ListFacturas";
import Boton from "../../components/Boton";
import Notification from "../../components/Notification";

const FacturasPage = () => {
    const [numeroInicialFactura, setNumeroInicialFactura] = useState("");
    const [notificationNumeroInicial, setNotificationNumeroInicial] = useState(false);

    const handleInputChange = (e) => {
        setNumeroInicialFactura(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación para asegurarse de que el número de factura no está vacío
        if (!numeroInicialFactura.trim()) {
            alert("Por favor, ingresa un número de factura.");
            return;
        }

        // Convierte el valor de la entrada a un entero
        const numeroInicial = parseInt(numeroInicialFactura, 10);
        console.log(numeroInicial);

        // Verifica si el valor es un número válido
        if (isNaN(numeroInicial)) {
            alert("El número de factura no es válido.");
            return;
        }

        try {
            await setNumeroFactura(numeroInicial); // Ahora se pasa un número
            setNumeroInicialFactura("");  // Restablece el campo de entrada
            setNotificationNumeroInicial(true);
        } catch (error) {
            console.error("Error al guardar la factura", error);
        }
    };

    return (
        <div className="container-facturacion">
            <div className="configurar-numero-facturacion">
                <h1>Configurar Número Inicial de Facturación</h1>
                <form onSubmit={handleSubmit}>
                    <label>Número de Factura:</label>
                    <input
                        type="number"
                        value={numeroInicialFactura}
                        onChange={handleInputChange}
                        placeholder="Ingrese el número inicial de su facturación"
                        required
                        />
                    <Boton onClick={handleSubmit} texto="Guardar" />
                </form>
                <Notification message="Número de factura establecido correctamente" isVisible={notificationNumeroInicial} onClose={() => setNotificationNumeroInicial(false)} type="success" />
            </div>
            <div className="table-facturas">
                <ListFacturas/>
            </div>
        </div>

    )
}

export default FacturasPage;