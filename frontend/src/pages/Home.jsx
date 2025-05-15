import React, { useEffect, useState } from "react";
import citasService from "../services/citasService";
import { Link } from 'react-router-dom';  // Importa Link para la navegación
import Boton from '../components/Boton'
import NotasList from "../components/notas/NotasList";
import PrecioModal from "../components/citas/precioModal";
import Notification from "../components/Notification";
import { createFactura } from "../services/facturaService";
import { getToken, getUserIdFromToken } from "../utils/auth";
import { fetchUserInfo } from "../services/userInfoService";
import '../styles/home.css'


function Home() {
    const [citasHoy, setCitasHoy] = useState([]);
    const [citasTomorrow, setCitasTomorrow] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCita, setSelectedCita] = useState(null);
    const [notificationPrecio, setNotificationPrecio] = useState(false)
    const [notificacionFactura, setNotificacionFactura] = useState(false)
    const [notificacionWhatsApp, setNotificacionWhatsApp] = useState(false);
    const [userInfo, setUserInfo] = useState([]);

    const token = getToken();
    const userId = getUserIdFromToken(token);

    useEffect(() => {
        const fetchCitasHoy = async () => {
            try {
                const citas = await citasService.getCitas(1, '', 'hoy');  // Filtrar citas de hoy
                setCitasHoy(citas);
            } catch (error) {
                console.error('Error al obtener las citas de hoy:', error);
            }
        };

        const fetchCitasTomorrow = async () => {
            try {
                const citas = await citasService.getCitas(1, "", 'mañana');
                setCitasTomorrow(citas);
            } catch (error) {
                console.error('Error al obtener las citas de mañana:', error);
            }
        }

        const fetchUserData = async () => {
            try {
                const data = await fetchUserInfo();
                setUserInfo(data); // Aquí guardamos los datos del usuario
            } catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
            }
        };

        fetchCitasHoy();
        fetchCitasTomorrow();
        fetchUserData(); // Llamada a la función del usuario
    }, []);

    // Función para manejar el cambio de toggle y actualizar la cita
    const handleToggleChange = async (citaId, field, setCitas, citas) => {
        if (!citas || citas.length === 0) {
            console.error("Las citas no están disponibles o son vacías");
            return;
        }
        try {
            // Obtener el estado actual de la cita que se quiere modificar
            const citaSeleccionada = citas.find(c => c.id === citaId);
            if (!citaSeleccionada) return;

            const nuevoEstado = !citaSeleccionada[field];

            // Actualizar la UI inmediatamente para reflejar el cambio
            setCitas(prevCitas =>
                prevCitas.map(c =>
                    c.id === citaId ? { ...c, [field]: nuevoEstado } : c
                )
            );

            // Enviar la actualización al backend
            await citasService.updateCita(citaId, { [field]: nuevoEstado });

            // Si se marca como "Cotizada", crear una factura
            // Si se marca cotizada, se crea la factura
            if(!citas[field]) {
                const facturaData = {
                    cita:citaId,
                    numero_factura: null,
                    total: citas.precio,
                    usuario: userId,
                };
                await createFactura(facturaData);
                setNotificacionFactura(true)
            }
        } catch (error) {
            console.error('Error al actualizar la cita', error);
        }
    };

    // Función para manejar el cambio de precio
    const handleSavePrecio = async (citaId, precio) => {
        try {
            await citasService.updateCita(citaId, { precio });
            // Actualizamos el estado de las citas con el nuevo precio
            setCitasHoy(prevCitas =>
                prevCitas.map(cita =>
                    cita.id === citaId ? { ...cita, precio } : cita
                )
            );
            setCitasTomorrow(prevCitas =>
                prevCitas.map(cita =>
                    cita.id === citaId ? { ...cita, precio } : cita
                )
            );
            setNotificationPrecio(true)
        } catch (error) {
            console.error("Error al guardar el precio:", error);
        }
    };

    const openModal = (cita) => {
        setSelectedCita(cita);  // Establecemos la cita seleccionada para mostrar en el modal
        setIsModalOpen(true);  // Abrimos el modal
    };

    const closeModal = () => {
        setIsModalOpen(false);  // Cerramos el modal
    };

    const enviarWhatsApp = async () => {
        if (citasTomorrow.length === 0) {
            alert('Añade al menos una cita para mañana');
            return;
        }

        const citasValidas = citasTomorrow.filter(cita => cita.patient_phone); // Asegúrate de tener este campo en cada cita

        if (citasValidas.length === 0) {
            alert('Ninguna cita de mañana tiene número de teléfono del paciente');
            return;
        }

        try {
            const result = await citasService.sendWhatsapp(citasValidas);
            console.log(result);
            setNotificacionWhatsApp(true)
        } catch (error) {
            console.error("Error al enviar los WhatsApp:", error);
            alert('Ocurrió un error al enviar los mensajes');
        }
    };
    return (
        <div className="container-home">
            <NotasList/>
            <div className="citas-filtradas">
                <div className="columnas">
                    <div className="columna">
                        <h2 className="title-section">Citas de Hoy</h2>
                        <table className="tabla-citas">
                            <thead className="head-table">
                                <tr className="tr-table">
                                    <th className="th-table">Paciente</th>
                                    <th className="th-table">Hora</th>
                                    <th className="th-table">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="tbody-table">
                                {citasHoy.map(cita => (
                                    <tr className="tr-table" key={cita.id}>
                                        <td className="td-table">{cita.patient_name} {cita.patient_primer_apellido}</td>
                                        <td className="td-table">{cita.comenzar}</td>
                                        <td className="td-table">
                                            <div className="toggle-buttons">
                                                <button
                                                    className="toggle-btn"
                                                    onClick={() => openModal(cita)}
                                                >
                                                    Precio
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.cotizada ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'cotizada', setCitasHoy, citasHoy)}
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.efectivo ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'efectivo', setCitasHoy, citasHoy)}
                                                >
                                                    Efectivo
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.bizum ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'bizum', setCitasHoy, citasHoy)}
                                                >
                                                    Bizum
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.pagado ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'pagado', setCitasHoy, citasHoy)}
                                                >
                                                    Pagado
                                                </button>
                                            </div>
                                            <Link to={`/api/citas/${cita.id}`}>
                                                <Boton texto="Ver Cita" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="columna">
                        <h2 className="title-section">Citas de Mañana</h2>
                        <table className="tabla-citas">
                            <thead className="head-table">
                                <tr className="tr-table">
                                    <th className="th-table">Paciente</th>
                                    <th className="th-table">Hora</th>
                                    <th className="th-table">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="tbody-table">
                                {citasTomorrow.map(cita => (
                                    <tr className="tr-table" key={cita.id}>
                                        <td className="td-table">{cita.patient_name} {cita.patient_primer_apellido}</td>
                                        <td className="td-table">{cita.comenzar}</td>
                                        <td className="td-table">
                                            <div className="toggle-buttons">
                                                <button
                                                    className="toggle-btn"
                                                    onClick={() => openModal(cita)}
                                                >
                                                    Precio
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.cotizada ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'cotizada', setCitasTomorrow, citasTomorrow)}
                                                >
                                                    Cotizada
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.efectivo ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'efectivo', setCitasTomorrow, citasTomorrow)}
                                                >
                                                    Efectivo
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.bizum ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'bizum', setCitasTomorrow, citasTomorrow)}
                                                >
                                                    Bizum
                                                </button>
                                                <button
                                                    className={`toggle-btn ${cita.pagado ? 'active' : ''}`}
                                                    onClick={() => handleToggleChange(cita.id, 'pagado', setCitasTomorrow, citasTomorrow)}
                                                >
                                                    Pagado
                                                </button>
                                            </div>
                                            <Link to={`/api/citas/${cita.id}`}>
                                                <Boton texto="Ver Cita" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Boton texto="Enviar WhatsApps" onClick={enviarWhatsApp} />
                    </div>
                </div>
            </div>

            {/* Nueva columna con el paciente asignado a las citas de hoy */}
            <div className="pacientes">
                <p className="title-section">Pacientes con cita hoy</p>
                <div className="columna-pacientes">

                    <ul className="lista-pacientes">
                        {citasHoy.length > 0 ? (
                            citasHoy.map((cita) => (
                                <li className="link-pacientes" key={cita.id}>
                                    <Link to={`api/pacientes/${cita.patient}`}>
                                        {cita.patient_name} {cita.patient_primer_apellido}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <p className="pacientes-paragraph">No hay pacientes con citas hoy.</p>
                        )}
                    </ul>
                </div>

                <p className="title-section">Pacientes con cita mañana</p>
                <div className="columna-pacientes">
                    <ul className="lista-pacientes">
                        {citasTomorrow.length > 0 ? (
                            citasTomorrow.map((cita) => (
                                <li className="link-pacientes" key={cita.id}>
                                    <Link to={`api/pacientes/${cita.patient}`}>
                                        {cita.patient_name} {cita.patient_primer_apellido}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <p className="pacientes-paragraph">No hay pacientes con citas mañana.</p>
                        )}
                    </ul>
                </div>
            </div>
            {/* Modal para ingresar el precio */}
            {isModalOpen && (
                <PrecioModal
                    cita={selectedCita}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleSavePrecio}
                />
            )}
            <Notification
                message="Precio cambiado correctamente"
                isVisible={notificationPrecio}
                onClose={() => setNotificationPrecio(false)}
                type="success"
                />
            <Notification
                message="Factura creada correctamente"
                isVisible={notificacionFactura}
                onClose={() => setNotificacionFactura(false)}
                type="success"
                />
            <Notification
                message="WhatsApp de citas enviados correctamente"
                isVisible={notificacionWhatsApp}
                onClose={() => setNotificacionWhatsApp(false)}
                type="succes"
                />
        </div>
    );
}

export default Home;
