import React, { useState, useEffect } from "react";
import { getToken, getUserIdFromToken } from "../../utils/auth";
import { createFormacion, getFormacion } from "../../services/formacionService";
import AgendaFormacion from "../../components/formacion/agendaFormacion";
import Boton from "../../components/Boton";
import Notification from "../../components/Notification";
import CustomModal from "../../components/Modal";



const initialFormacionData = {
    titulo: '',
    profesional: '',
    lugar: '',
    tematica: '',
    fecha_inicio: '',
    fecha_fin: '',
    hora: '',
}

const Formacion = () => {
    const [formacion, setFormacion] = useState([]);
    const [newFormacion, setNewFormacion] = useState(initialFormacionData);
    const [showModal, setShowModal] = useState(false);
    const [notificationVisibleCrear, setNotificationVisibleCrear] = useState(false)

    const token = getToken()
    const id = getUserIdFromToken(token);

    // Obtener formaciones al cargar el componente
    const fetchFormaciones = async () => {
        try {
            const response = await getFormacion();
            setFormacion(response.results)
        } catch (error) {
            console.error("Error al obtener las formaciones", error)
        }
    };

    useEffect(() => {
        fetchFormaciones();
    }, [])

    // Función para abrir el modal
    const handleCreateModal = () => {
        setNewFormacion(initialFormacionData);
        setNewFormacion(true);
        setShowModal(true);
    };

    // Función para manejar los cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewFormacion({ ...newFormacion, [name]: value});
    };

    // Funcion para guardar la formación
    const handleSaveFormacion = async () => {
        try {
            const response = await createFormacion(newFormacion);
            setFormacion([...formacion, response]);
            setShowModal(false);
            setNotificationVisibleCrear(true);
        } catch (error){
            console.error("Error al crear la formación:", error)
        }
    }

    return (
        <div className="container-formacion">
            <h1 className="title-section">Agenda de Formación</h1>
            <div className="formacion-boton-container">
                <Boton texto="Añadir Formación" onClick={handleCreateModal} tipo="primario"/>
            </div>

            {/* Modal para añadir formación */}
            <CustomModal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                title="Añadir Nueva Formación"
                actions={[
                    {
                        text: "Guardar",
                        onClick: handleSaveFormacion,
                        className: "guardar",
                    },
                ]}
            >
                <form className="formacion-form">
                    <label>
                        Título:
                        <input type="text" name="titulo" value={newFormacion.titulo} onChange={handleChange}/>
                    </label>
                    <label>
                        Profesional:
                        <input type="text" name="profesional" value={newFormacion.profesional} onChange={handleChange}/>
                    </label>
                    <label>
                        Lugar:
                        <input type="text" name="lugar" value={newFormacion.lugar} onChange={handleChange}/>
                    </label>
                    <label>
                        Temática:
                        <input type="text" name="tematica" value={newFormacion.tematica} onChange={handleChange}/>
                    </label>
                    <label>
                        Fecha de inicio:
                        <input type="date" name="fecha_inicio" value={newFormacion.fecha_inicio} onChange={handleChange}/>
                    </label>
                    <label>
                        Fecha de finalización:
                        <input type="date" name="fecha_fin" value={newFormacion.fecha_fin} onChange={handleChange}/>
                    </label>
                    <label>
                        Hora:
                        <input type="time" name="hora" value={newFormacion.hora} onChange={handleChange}/>
                    </label>
                </form>
            </CustomModal>
            <Notification
                message="Formación creada correctamente"
                isVisible={notificationVisibleCrear}
                onClose={() => setNotificationVisibleCrear(false)}
                type="success"
            />
            <div className="container-agenda">
                <AgendaFormacion formaciones={formacion} fetchFormaciones={fetchFormaciones} />
            </div>
        </div>
    )
}

export default Formacion;