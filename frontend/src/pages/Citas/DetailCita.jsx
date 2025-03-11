import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import citasService from "../../services/citasService";
import "../../styles/citas/citasDetail.css";

function DetailCita() {
    const { id } = useParams();
    const [cita, setCita] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCita = async () => {
            try {
                const data = await citasService.getCitaDetail(id);
                setCita(data);
            } catch (error) {
                console.error('Error al obtener los datos de la cita', error)
            } finally {
                setLoading(false);
            }
        };
        fetchCita();
    }, [id]);

    // Función para cambiar el valor booleano y actualizar en el backend
    const toggleBoolean = async (field) => {
        const newValue = !cita[field]; // Invertir el valor actual

        // Actualizar el estado local primero
        setCita((prevCita) => ({
            ...prevCita,
            [field]: newValue,
        }));

        try {
            // Llamar a la API para actualizar en el backend
            await citasService.updateCita(id, { [field]: newValue });
            console.log(`Campo ${field} actualizado en el backend.`);
        } catch (error) {
            console.error(`Error al actualizar ${field}:`, error);

            // Si falla, revertir el cambio en el estado local
            setCita((prevCita) => ({
                ...prevCita,
                [field]: !newValue, // Deshacer la actualización en el frontend
            }));
        }
    };


    if (loading) return <p>Cargando...</p>;

    return (
        <div className="container-detail-cita">
            <h1 className="title-detail-cita">Detalle de la Cita</h1>
            {cita ? (
                <div className="cita-info">
                    <div className="cita-field">
                        <strong>Paciente:</strong>
                        <span>{cita.patient_name} {cita.patient_primer_apellido} {cita.patient_segundo_apellido}</span>
                    </div>
                    <div className="cita-field"><strong>Fecha:</strong><span>{cita.fecha}</span></div>
                    <div className="cita-field"><strong>Hora de comienzo:</strong><span>{cita.comenzar}</span></div>
                    <div className="cita-field"><strong>Hora de finalizar:</strong><span>{cita.finalizar}</span></div>
                    <div className="cita-field"><strong>Precio:</strong><span>{cita.precio}</span></div>

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
                <p>No se encontró la cita.</p>
            )}
        </div>
    );
}

export default DetailCita;
