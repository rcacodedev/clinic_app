import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateCita, getCitaDetail } from "../../services/citasService";
import { createFactura } from "../../services/facturaService";
import Notification from "../../components/Notification";

function DetailCita() {
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [precioEditable, setPrecioEditable] = useState(false);
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [notificacionFactura, setNotificacionFactura] = useState(false);

  const fetchCita = async () => {
    try {
      const data = await getCitaDetail(id);
      if (data) {
        setCita(data);
        setNuevoPrecio(data.precio);
      } else {
        console.error("No se encontraron datos para la cita");
        setCita({});
      }
    } catch (error) {
      console.error("Error al obtener los datos de la cita", error);
      setCita({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCita();
  }, [id]);

  // Verifica que `cita` esté disponible antes de usarla
  const isCitaValid =
    cita && typeof cita === "object" && Object.keys(cita).length > 0;

  const toggleBoolean = async (field) => {
    if (!isCitaValid) return; // Verificar si cita es válida

    const newValue = !cita[field]; // Invertir el valor actual

    // Si el campo es "cotizada" y el nuevo valor es true, actualizar primero y luego crear la factura
    if (field === "cotizada" && newValue === true) {
      // Actualizar el campo 'cotizada' primero en el backend
      try {
        await updateCita(id, { [field]: newValue });

        // Crear la factura después de que el campo 'cotizada' se haya actualizado
        const facturaData = {
          created_at: new Date().toISOString().split("T")[0], // Fecha actual
          total: cita.precio, // Total de la cita
          cita: cita.id, // ID de la cita
          paciente: cita.patient, // ID del paciente
        };

        try {
          await createFactura(facturaData); // Crear la factura
          setNotificacionFactura(true);
          fetchCita();
        } catch (error) {
          console.error(
            "Error al crear la factura:",
            error.response || error.message
          );
          // Revertir el cambio en caso de error al crear la factura
          setCita((prevCita) => ({
            ...prevCita,
            [field]: !newValue, // Deshacer la actualización de cotizada
          }));
        }
      } catch (error) {
        console.error(
          `Error al actualizar ${field}:`,
          error.response || error.message
        );
        // Si falla la actualización, revertir el cambio en el estado local
        setCita((prevCita) => ({
          ...prevCita,
          [field]: !newValue, // Deshacer la actualización en el frontend
        }));
      }
    } else {
      // Para otros campos booleanos, simplemente actualizamos en el backend
      try {
        setCita((prevCita) => ({
          ...prevCita,
          [field]: newValue,
        }));

        // Llamar a la API para actualizar el campo en el backend
        await updateCita(id, { [field]: newValue });
      } catch (error) {
        console.error(
          `Error al actualizar ${field}:`,
          error.response || error.message
        );
        // Si falla, revertir el cambio en el estado local
        setCita((prevCita) => ({
          ...prevCita,
          [field]: !newValue, // Deshacer la actualización en el frontend
        }));
      }
    }
  };

  // Función para manejar el cambio del precio
  const handlePrecioChange = (e) => {
    setNuevoPrecio(e.target.value);
  };

  // Función para guardar el nuevo precio
  const handleSavePrecio = async () => {
    if (!isCitaValid) return; // Verificar si cita es válida
    try {
      // Actualizar el estado local
      setCita((prevCita) => ({
        ...prevCita,
        precio: nuevoPrecio,
      }));

      // Llamar a la API para actualizar en el backend
      await updateCita(id, { precio: nuevoPrecio });
      setPrecioEditable(false); // Deshabilitar el campo de edición
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
      alert("Error al actualizar el precio.");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="main-container">
      <h1 className="title-section">Detalle de la Cita</h1>
      {isCitaValid ? (
        <div className="cita-info">
          <div className="cita-field">
            <strong>Paciente:</strong>
            <span>
              {cita.patient_name} {cita.patient_primer_apellido}{" "}
              {cita.patient_segundo_apellido}
            </span>
          </div>
          <div className="cita-field">
            <strong>Fecha:</strong>
            <span>{cita.fecha}</span>
          </div>
          <div className="cita-field">
            <strong>Hora de comienzo:</strong>
            <span>{cita.comenzar}</span>
          </div>
          <div className="cita-field">
            <strong>Hora de finalizar:</strong>
            <span>{cita.finalizar}</span>
          </div>

          {/* Campo editable de precio */}
          <div className="cita-field">
            <strong>Precio:</strong>
            {precioEditable ? (
              <div>
                <input
                  type="number"
                  value={nuevoPrecio}
                  onChange={handlePrecioChange}
                  step="0.01"
                />
                <button onClick={handleSavePrecio}>Guardar</button>
                <button onClick={() => setPrecioEditable(false)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <span>{cita.precio}</span>
                <button onClick={() => setPrecioEditable(true)}>Editar</button>
              </div>
            )}
          </div>

          {/* Botones de Sí/No para booleanos */}
          {["pagado", "bizum", "cotizada", "efectivo"].map((field) => (
            <div className="cita-field" key={field}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
              <div className="boolean-buttons">
                <button
                  className={cita[field] ? "active" : ""}
                  onClick={() => toggleBoolean(field)}
                >
                  Sí
                </button>
                <button
                  className={!cita[field] ? "active" : ""}
                  onClick={() => toggleBoolean(field)}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No se encontró la cita o los datos están incompletos.</p>
      )}
      <Notification
        message="Factura creada correctamente"
        type="success"
        onClose={() => setNotificacionFactura(false)}
        isVisible={notificacionFactura}
      />
    </div>
  );
}

export default DetailCita;
