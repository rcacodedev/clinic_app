import React, { useState, useEffect, useRef } from "react";
import { createCita, getCitas } from "../../services/citasService";
import { getWorkerID } from "../../services/workerService";
import { getToken, getUserIdFromToken, isAdmin } from "../../utils/auth";
import CrearCitaModal from "../../components/citas/CrearCitaModal";
import { toast } from "react-toastify";
import ListaCitas from "../../components/citas/ListCitas";

const initialCitaState = {
  patient_id: "", // usa patient_id para enviar el id seleccionado
  fecha: "",
  comenzar: "",
  finalizar: "",
  descripcion: "",
};

const CitasPage = () => {
  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState(initialCitaState);
  const [modalCrearCita, setModalCrearCita] = useState(false);

  const [workerId, setWorkerID] = useState(null);

  const token = getToken();
  const userId = getUserIdFromToken(token);
  const firstInputRef = useRef();

  // Cargar citas desde el servicio
  const loadCitas = async () => {
    try {
      const data = await getCitas();
      setCitas(data);
    } catch (error) {
      console.error("Error al cargar las citas:", error);
    }
  };
  useEffect(() => {
    if (userId) {
      const fetchWorkerID = async () => {
        try {
          const worid = await getWorkerID(userId);
          setWorkerID(worid);
        } catch (error) {
          console.error("Error al obtener el workerID", error);
        }
      };

      loadCitas();
      fetchWorkerID();
    }
  }, [userId, workerId]);

  // Función Crear Cita
  const handleAddCita = async (e) => {
    e.preventDefault();

    try {
      // Envía directamente el objeto formData con los datos
      const nuevaCita = await createCita(formData);
      setCitas((prevCitas) => [...prevCitas, nuevaCita]); // Añade la nueva cita a la lista
      setModalCrearCita(false);
      loadCitas();
      toast.success("Se creó correctamente la cita");
    } catch (error) {
      console.error(
        "Error al crear la cita",
        error.response?.data || error.message
      );
      toast.error("Error al crear la cita");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...citas, [name]: value });
  };

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Citas</h1>
        <p className="title-description">
          Listado de citas. Configuración de las citas.
        </p>
      </div>

      <button className="btn-primary" onClick={() => setModalCrearCita(true)}>
        Añadir Cita
      </button>

      {modalCrearCita && (
        <CrearCitaModal
          onClose={() => setModalCrearCita(false)}
          onSubmit={handleAddCita}
          formData={formData}
          setFormData={setFormData}
          onChange={handleInputChange}
          isOpen={() => setModalCrearCita(true)}
          firstInputRef={firstInputRef}
        />
      )}

      <ListaCitas citas={citas} userId={userId} />
    </div>
  );
};

export default CitasPage;
