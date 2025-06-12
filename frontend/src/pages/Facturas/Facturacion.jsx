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
import { toast } from "react-toastify";

const FacturasPage = () => {
  const [numeroInicialFactura, setNumeroInicialFactura] = useState("");

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
        toast.error("Hubo un error al obtener el precio global actual");
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
      toast.success("Número nuevo de factura configurado correctamente");
    } catch (error) {
      console.error("Error al guardar la factura", error);
      toast.error("Hubo un error al configurar el número de factura nuevo");
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
      toast.success("Precio global de las citas actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el precio de la cita:", error);
      toast.error("Hubo un error al actualizar el precio global de las citas");
    }
  };

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Facturación</h1>
        <p className="title-description">
          Listado de todas las facturas. Configuración global de precios.
        </p>
      </div>
      <ListFacturas />
      <div className="configurar-numero-facturacion">
        <h3 className="title-section mt-5">
          Configuraciones para la Facturación
        </h3>

        {/* Configuración número de factura */}
        <form onSubmit={handleSubmit}>
          <label className="modal-label">Número de Factura:</label>
          <input
            type="number"
            value={numeroInicialFactura}
            onChange={handleInputChange}
            placeholder="Ingrese el número inicial de su facturación"
            required
            className="modal-input"
          />
          <button className="btn-toogle mt-5" onClick={handleSubmit}>
            Guardar
          </button>
        </form>

        {/* Configuración precio global de cita */}
        <form onSubmit={handlePrecioSubmit} style={{ marginTop: "2rem" }}>
          <label className="modal-label">Precio Global de la Cita:</label>
          <input
            type="number"
            step="0.01"
            value={precioCita}
            onChange={(e) => setPrecioCita(e.target.value)}
            placeholder="Ej: 25.00"
            className="modal-input"
            required
          />
          <button className="btn-toogle mt-5" onClick={handlePrecioSubmit}>
            Nuevo Precio
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacturasPage;
