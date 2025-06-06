import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getActivity,
  updateActivity,
  deleteActivity,
} from "../../services/activityService";
import { getPacientesById, getPacientes } from "../../services/patientService";
import { getToken, decodeJWT } from "../../utils/auth";
import { fetchWorkers } from "../../services/workerService";
import EditarActividadModal from "../../components/actividades/EditarActividadModal";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "react-toastify";

const ActividadesProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monitor_id: "",
    start_time: "",
    end_time: "",
    recurrence_days: [],
    precio: 0,
  });

  const [pacientes, setPacientes] = useState([]);
  const [pacientesAsignados, setPacientesAsignados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePatientsCount, setVisiblePatientsCount] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workersOptions, setWorkersOptions] = useState([]);

  const fetchActividad = async () => {
    try {
      const response = await getActivity(id);
      if (response) {
        setActividad(response);
        const pacientesDetails = await Promise.all(
          (response.patients || []).map((id) => getPacientesById(id))
        );
        setPacientesAsignados(pacientesDetails);
      }
    } catch (error) {
      console.error("Error al cargar la actividad:", error);
      toast.error("Error al cargar los datos de la actividad");
    }
  };
  // Cargar actividad y pacientes asignados
  useEffect(() => {
    fetchActividad();
  }, [id]);

  // Sincronizar formData con la actividad cargada
  useEffect(() => {
    if (actividad && actividad.name) {
      setFormData({
        name: actividad.name || "",
        description: actividad.description || "",
        monitor_id: actividad.monitor?.id || "",
        start_time: actividad.start_time || "",
        end_time: actividad.end_time || "",
        recurrence_days: actividad.recurrence_days || [],
        precio: actividad.precio || 0,
      });
    }
  }, [actividad]);

  // Cargar pacientes disponibles
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getPacientes({
          searchTerm,
          includePagination: false,
        });
        setPacientes(data.results || []);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
        toast.error("Error al cargar los pacientes");
      }
    };

    fetchPacientes();
  }, [searchTerm]);

  // Scroll infinito para pacientes disponibles
  const handleScroll = useCallback(() => {
    const container = document.querySelector(".left-column");
    if (container) {
      const bottom =
        container.scrollHeight - container.scrollTop === container.clientHeight;
      if (bottom && pacientes.length > visiblePatientsCount) {
        setVisiblePatientsCount((count) => count + 5);
      }
    }
  }, [pacientes.length, visiblePatientsCount]);

  useEffect(() => {
    const container = document.querySelector(".left-column");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleUpdate = async () => {
    try {
      await updateActivity(actividad.id, formData);
      navigate(`/actividades/${actividad.id}`);
      fetchActividad();
      setEditMode(false);
      toast.success("Actividad actualizada con éxito");
    } catch (error) {
      console.error("Error al actualizar actividad:", error);
      toast.error("Error al actualizar la actividad");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteActivity(actividad.id);
      navigate("/actividades");
      toast.success("Actividad eliminada con éxito");
    } catch (error) {
      console.error("Error al eliminar actividad:", error);
      toast.error("Error al eliminar la actividad");
    }
  };

  const addPaciente = async (paciente) => {
    const nuevosAsignados = [...pacientesAsignados, paciente];
    const updatedActividad = {
      ...actividad,
      patients: nuevosAsignados.map((p) => p.id),
    };

    try {
      await updateActivity(id, updatedActividad);
      setPacientesAsignados(nuevosAsignados);
      setPacientes(pacientes.filter((p) => p.id !== paciente.id));
      setActividad(updatedActividad);
    } catch (error) {
      console.error("Error al asignar paciente:", error);
      toast.error("Error al asignar el paciente a la actividad");
    }
  };

  const removePaciente = async (paciente) => {
    const nuevosAsignados = pacientesAsignados.filter(
      (p) => p.id !== paciente.id
    );
    const updatedActividad = {
      ...actividad,
      patients: nuevosAsignados.map((p) => p.id),
    };

    try {
      await updateActivity(id, updatedActividad);
      setPacientesAsignados(nuevosAsignados);
      setPacientes([...pacientes, paciente]);
      setActividad(updatedActividad);
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      toast.error("Error al eliminar el paciente de la actividad");
    }
  };

  const filteredPacientes = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchWorkersOptions = async () => {
      try {
        // Llamamos a la función para obtener el token
        const token = getToken();
        if (!token) {
          console.error("Token no encontrado");
          return;
        }
        // Decodificamos el token para obtener los datos del usuario
        const decodedUser = decodeJWT(token);
        if (!decodedUser) {
          console.error("No se pudo decodificar el token");
          return;
        }
        // Extraemos el nombre y apellido del usuario desde el token decodificado
        // Aquí es donde verificas si los datos del nombre están disponibles
        const currentUser = {
          id: decodedUser.user_id,
          name:
            decodedUser.first_name && decodedUser.last_name
              ? `${decodedUser.first_name} ${decodedUser.last_name}`
              : "Usuario Desconocido",
        };
        // Ahora hacemos la llamada a la API para obtener los trabajadores
        const response = await fetchWorkers(); // Suponiendo que fetchWorkers es la función para obtener la lista de trabajadores
        // Si la respuesta no tiene resultados, terminamos
        if (!response.results || response.results.length === 0) {
          console.error("No se encontraron empleados");
          return;
        }
        // Formateamos la lista de trabajadores
        const formattedWorkers = response.results.map((worker) => ({
          id: worker.user.id,
          name: `${worker.user.first_name} ${worker.user.last_name}`,
        }));
        // Agregamos el usuario actual (el que creó la actividad) a la lista de monitores
        const allMonitors = [currentUser, ...formattedWorkers];
        // Actualizamos el estado con los monitores formateados
        setWorkersOptions(allMonitors); // Asegúrate de tener el estado correctamente configurado
      } catch (error) {
        console.error("Error al cargar monitores:", error);
        toast.error("Error al cargar monitores");
      }
    };

    fetchWorkersOptions();
  }, []);

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Detalles de la Actividad {actividad.name}</h1>
        <p className="title-description">
          Información de la actividad y asignación de los pacientes.
        </p>
      </div>

      <h4 className="title-section">Información de {actividad.name}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-lg mb-5">
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Nombre</span>
          <span className="text-base font-medium text-gray-800">
            {actividad.name}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Descripción</span>
          <span className="text-base font-medium text-gray-800">
            {actividad.description}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Monitor</span>
          <span className="text-base font-medium text-gray-800">
            {actividad.monitor_detail
              ? `${actividad.monitor_detail.first_name} ${actividad.monitor_detail.last_name}`
              : "Monitor no asignado"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Hora de Comienzo
          </span>
          <span className="text-base font-medium text-gray-800">
            {actividad.start_time?.slice(0, 5)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Días de la semana
          </span>
          <span className="text-base font-medium text-gray-800">
            {actividad.recurrence_days && (
              <p>{actividad.recurrence_days.join(" - ")}</p>
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Hora de Finalización
          </span>
          <span className="text-base font-medium text-gray-800">
            {actividad.end_time?.slice(0, 5)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Precio</span>
          <span className="text-base font-medium text-gray-800">
            {actividad.precio} Euros/mes
          </span>
        </div>
      </div>
      <div className="mt-3">
        <button onClick={() => setEditMode(true)} className="btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path d="M21.707,4.475,19.525,2.293a1,1,0,0,0-1.414,0L9.384,11.021a.977.977,0,0,0-.241.39L8.052,14.684A1,1,0,0,0,9,16a.987.987,0,0,0,.316-.052l3.273-1.091a.977.977,0,0,0,.39-.241l8.728-8.727A1,1,0,0,0,21.707,4.475Z" />
            <path d="M2,6A1,1,0,0,1,3,5h8a1,1,0,0,1,0,2H4V20H17V13a1,1,0,0,1,2,0v8a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1Z" />
          </svg>
        </button>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="btn-eliminar"
        >
          <svg
            viewBox="0 0 1024 1024"
            fill="white"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M32 241.6c-11.2 0-20-8.8-20-20s8.8-20 20-20l940 1.6c11.2 0 20 8.8 20 20s-8.8 20-20 20L32 241.6zM186.4 282.4c0-11.2 8.8-20 20-20s20 8.8 20 20v688.8l585.6-6.4V289.6c0-11.2 8.8-20 20-20s20 8.8 20 20v716.8l-666.4 7.2V282.4z" />
            <path d="M682.4 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM367.2 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM524.8 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM655.2 213.6v-48.8c0-17.6-14.4-32-32-32H418.4c-18.4 0-32 14.4-32 32.8V208h-40v-42.4c0-40 32.8-72.8 72.8-72.8H624c40 0 72.8 32.8 72.8 72.8v48.8h-41.6z" />
          </svg>
        </button>
      </div>

      {editMode && (
        <EditarActividadModal
          formData={formData}
          setFormData={setFormData}
          workersOptions={workersOptions}
          onClose={() => setEditMode(false)}
          onSave={handleUpdate}
        />
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar este paciente?"
      />

      <h4 className="title-section">Asignar Pacientes</h4>
      <div className="search-container">
        <div className="search-component">
          <div className="input-svg-search">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89
                                3.476l4.817 4.817a1 1 0 01-1.414
                                1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-search"
          />
        </div>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pacientes Disponibles */}
          <div className="rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">
              Pacientes Disponibles
            </h4>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {filteredPacientes.slice(0, visiblePatientsCount).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100"
                >
                  <span className="text-gray-700">
                    {p.nombre} {p.primer_apellido} {p.segundo_apellido}
                  </span>
                  <button
                    onClick={() => addPaciente(p)}
                    className="text-green-600 hover:text-white hover:bg-green-500 border border-green-500 rounded px-2 py-1 transition-colors duration-200"
                    aria-label="Agregar paciente"
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Pacientes Asignados */}
          <div className="rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">
              Pacientes Asignados
            </h4>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {pacientesAsignados.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100"
                >
                  <span className="text-gray-700">
                    {p.nombre} {p.primer_apellido} {p.segundo_apellido}
                  </span>
                  <button
                    onClick={() => removePaciente(p)}
                    className="text-red-600 hover:text-white hover:bg-red-500 border border-red-500 rounded px-2 py-1 transition-colors duration-200"
                    aria-label="Quitar paciente"
                  >
                    -
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActividadesProfile;
