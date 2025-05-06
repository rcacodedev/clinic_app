import React, { useState, useEffect } from "react";
import { setNumeroFactura } from "../../services/facturaService";
import {
  obtenerPrecioGlobal,
  actualizarPrecioGlobal,
} from "../../services/citasService";
import ListFacturas from "../../components/facturacion/ListFacturas";
import Boton from "../../components/Boton";
import Notification from "../../components/Notification";
import "../../styles/facturacion/facturacion.css";

const FacturasPage = () => {
  const [numeroInicialFactura, setNumeroInicialFactura] = useState("");
  const [notificationNumeroInicial, setNotificationNumeroInicial] = useState(false);

  const [precioCita, setPrecioCita] = useState("");
  const [notificationPrecio, setNotificationPrecio] = useState(false);

  // Obtener el precio global actual al montar el componente
  useEffect(() => {
    const cargarPrecio = async () => {
      try {
        const precio = await obtenerPrecioGlobal();
        setPrecioCita(precio);
      } catch (error) {
        console.error("Error al obtener el precio global de la cita:", error);
      }
    };

    cargarPrecio();
  }, []);

  const handleInputChange = (e) => {
    setNumeroInicialFactura(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!numeroInicialFactura.trim()) {
      alert("Por favor, ingresa un número de factura.");
      return;
    }

    const numeroInicial = parseInt(numeroInicialFactura, 10);

    if (isNaN(numeroInicial)) {
      alert("El número de factura no es válido.");
      return;
    }

    try {
      await setNumeroFactura(numeroInicial);
      setNumeroInicialFactura("");
      setNotificationNumeroInicial(true);
    } catch (error) {
      console.error("Error al guardar la factura", error);
    }
  };

  const handlePrecioSubmit = async (e) => {
    e.preventDefault();

    const precio = parseFloat(precioCita);
    if (isNaN(precio)) {
      alert("Por favor, introduce un precio válido.");
      return;
    }

    try {
      await actualizarPrecioGlobal(precio);
      setNotificationPrecio(true);
    } catch (error) {
      console.error("Error al actualizar el precio de la cita:", error);
    }
  };

  return (
    <div className="container-facturacion">
      <div className="configurar-numero-facturacion">
        <h1 className="title-section">Configuraciones para la Facturación</h1>

        {/* Configuración número de factura */}
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
        <Notification
          message="Número de factura establecido correctamente"
          isVisible={notificationNumeroInicial}
          onClose={() => setNotificationNumeroInicial(false)}
          type="success"
        />

        {/* Configuración precio global de cita */}
        <form onSubmit={handlePrecioSubmit} style={{ marginTop: "2rem" }}>
          <label>Precio Global de la Cita:</label>
          <input
            type="number"
            step="0.01"
            value={precioCita}
            onChange={(e) => setPrecioCita(e.target.value)}
            placeholder="Ej: 25.00"
            required
          />
          <Boton onClick={handlePrecioSubmit} texto="Actualizar Precio" />
        </form>
        <Notification
          message="Precio de cita actualizado correctamente"
          isVisible={notificationPrecio}
          onClose={() => setNotificationPrecio(false)}
          type="success"
        />
      </div>

      <div className="table-facturas">
        <ListFacturas />
      </div>
    </div>
  );
};

export default FacturasPage;
