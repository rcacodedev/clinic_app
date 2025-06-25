import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchWorkerDetails,
  deleteWorker,
  updateWorker,
} from "../../services/workerService";
import { fetchGrupos } from "../../services/django";
import EditarEmpleadoModal from "../../components/Workers/EditarEmpleadoModal";
import WorkerPDFUpload from "../../components/Workers/RegistroJornada";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const firstInputRef = useRef();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalEditarWorker, setModalEditarWorker] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [allGroups, setAllGroups] = useState([]); // ← todos los grupos
  const [workerGroups, setWorkerGroups] = useState([]); // ← grupos del trabajador
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    groups: [],
    color: "#ffffff",
  });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [modalEliminarWorker, setModalEliminarWorker] = useState(false);

  const loadData = async () => {
    try {
      await Promise.all([loadWorker()]);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos del trabajador");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [id]);

  const loadWorker = async () => {
    const data = await fetchWorkerDetails(id);
    setWorker(data);

    const allFetchedGroups = await fetchGrupos();
    setAllGroups(allFetchedGroups); // ← guardamos todos los grupos

    // Solo los grupos del trabajador
    const groupNames = data.groups.map((groupId) => {
      const group = allFetchedGroups.find((g) => g.id === groupId);
      return group ? group.name : "Grupo desconocido";
    });
    setWorkerGroups(groupNames);
  };

  const handleDeleteWorker = async () => {
    try {
      await deleteWorker(id);
      toast.success("Empleado eliminado correctamente");
      navigate("/workers");
    } catch (error) {
      console.error("Error al eliminar el empleado:", error);
      toast.error("Hubo un error al eliminar al empleado");
    } finally {
      setModalEliminarWorker(false);
      setSelectedWorker(null);
    }
  };

  const handleOpenEditarModal = () => {
    setFormData({
      groups: worker.groups || [], // si worker tiene grupos
      color: worker.color || "#ffffff", // si worker tiene color
    });
    setModalEditarWorker(true);
  };

  const handleCloseEditarModal = () => {
    setModalEditarWorker(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "groups") {
      setFormData((prev) => ({
        ...prev,
        groups: [parseInt(value)],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleSubmitEditar = async (updatedWorkerData) => {
    try {
      await updateWorker(id, updatedWorkerData);
      setModalEditarWorker(false);
      toast.success("El empleado fue editado correctamente");
      loadData();
    } catch (error) {
      console.error("Hubo un error al editar empleado", error);
      toast.error("Ha ocurrido un error al editar el empleado");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!worker) return <p>No se encontraron datos del empleado.</p>;
  console.log(worker);

  return (
    <div className="main-container">
      <div className="title-container flex items-center gap-6">
        <div className="photo-container shrink-0">
          {worker.user.userInfo?.photo ? (
            <img
              src={worker.user.userInfo.photo}
              alt="Foto perfil del empleado."
              className="object-center object-cover rounded-full h-36 w-36 border-4 border-white"
            />
          ) : (
            <svg
              className="w-36 h-36 text-gray-400 rounded-full bg-gray-700 p-2 border-4 border-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div>
          <h1 className="title">
            Perfil de {worker.user.first_name} {worker.user.last_name}
          </h1>
          <p className="title-description">
            Datos personales del empleado. Citas del empleado. Documentación y
            facturación.
          </p>
        </div>
      </div>
      <h2 className="title-section mb-3">Datos del Empleado</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-lg mb-5">
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Nombre del Empleado
          </span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.nombre} {worker.user.userInfo.primer_apellido}{" "}
            {worker.user.userInfo.segundo_apellido}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Email</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.email}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Teléfono</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.phone}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Fecha de nacimiento
          </span>
          <span className="text-base font-medium text-gray-800">
            {new Date(
              worker.user.userInfo.fecha_nacimiento
            ).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">DNI</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.dni}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Dirección</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.address}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Ciudad</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.city}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Código Postal</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.postal_code}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">País</span>
          <span className="text-base font-medium text-gray-800">
            {worker.user.userInfo.country}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Departamento</span>
          <span className="text-base font-medium text-gray-800">
            <span>
              {worker.groups && worker.groups.length > 0
                ? worker.groups
                    .map((groupId) => {
                      const group = allGroups.find((g) => g.id === groupId);
                      return group ? group.name : null;
                    })
                    .filter(Boolean) // elimina posibles nulls
                    .join(", ")
                : "No asignado"}
            </span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Color</span>
          <span className="text-base font-medium text-gray-800">
            <div
              style={{
                width: "50px",
                height: "20px",
                backgroundColor: worker.color,
                marginTop: "5px",
                borderRadius: "5px",
              }}
            />
          </span>
        </div>
      </div>

      <div className="mt-3">
        <button onClick={handleOpenEditarModal} className="btn-primary">
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
          onClick={() => setIsDeleteConfirmOpen(true)}
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

      {modalEditarWorker && (
        <EditarEmpleadoModal
          isOpen={modalEditarWorker}
          onClose={handleCloseEditarModal}
          onSubmit={handleSubmitEditar}
          onChange={handleFormChange}
          formData={formData}
          firstInputRef={firstInputRef}
          groups={groups}
          allGroups={allGroups}
          setFormData={setFormData}
        />
      )}

      <div className="Documentacion">
        <WorkerPDFUpload workerId={id} />
      </div>
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteWorker}
        message="¿Estás seguro de que deseas eliminar este empleado?"
      />
    </div>
  );
};

export default WorkerProfile;
