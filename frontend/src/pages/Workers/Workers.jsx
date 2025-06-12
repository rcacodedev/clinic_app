import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CrearEmpleadoModal from "../../components/Workers/CrearEmpleadoModal";
import { toast } from "react-toastify";
import { createWorker, fetchWorkers } from "../../services/workerService";
import { fetchGrupos } from "../../services/django";

const WorkersPage = () => {
  const [modalCrearEmpleado, setModalCrearEmpleado] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    groups: [],
    color: "#ffffff",
    phone: "",
    photo: null,
  });
  const [error, setError] = useState("");
  const [workers, setWorkers] = useState([]);
  const [groups, setGroups] = useState([]);

  const firstInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const workersList = await fetchWorkers();
        setWorkers(workersList.results);
      } catch (error) {
        console.error("Error al cargar los trabajadores:", error);
        toast.error("Hubo un error al cargar los empleados");
      }
    };

    const loadGroups = async () => {
      try {
        const gruposList = await fetchGrupos();
        setGroups(gruposList);
      } catch (error) {
        console.error("Error al cargar los grupos:", error);
      }
    };

    loadWorkers();
    loadGroups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? e.target.files[0] : value,
    });
  };

  const handleOpenModal = () => setModalCrearEmpleado(true);

  const handleCloseModal = () => {
    setModalCrearEmpleado(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      groups: [],
      color: "#ffffff",
      phone: "",
      photo: null,
    });
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const workerData = {
      user: {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        confirm_password: formData.confirm_password,
      },
      groups: formData.groups.length > 0 ? [parseInt(formData.groups)] : [],
      color: formData.color,
      userInfo: {
        phone: formData.phone,
        photo: formData.photo,
      },
    };

    try {
      const newWorker = await createWorker(workerData);
      setWorkers([...workers, newWorker]);
      handleCloseModal();
      toast.success("El empleado se creó correctamente");
    } catch (error) {
      console.error("Error al crear el empleado", error);
      toast.error("Ocurrió un error al crear el empleado");
    }
  };

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Empleados</h1>
        <p className="title-description">
          Crea y gestiona a todos tus empleados.
        </p>
      </div>

      <button className="btn-primary" onClick={handleOpenModal}>
        Añadir Empleado
      </button>

      <div className="w-full bg-zinc-500">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-12">
          <div className="text-center pb-12">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl font-heading text-white">
              Tu equipo de empleados
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.length > 0 ? (
              workers.map((worker) => (
                <div
                  key={worker.id}
                  className="w-full bg-zinc-800 rounded-lg shadow-lg p-8 flex flex-col justify-center items-center transition-transform transform hover:scale-105 hover:shadow-2xl border border-transparent hover:border-[var(--worker-color)] cursor-pointer"
                  style={{ "--worker-color": worker.color }}
                  onClick={() => navigate(`/workers/${worker.id}`)}
                >
                  <div className="mb-4">
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
                  <div className="text-center text-white">
                    <p className="text-sm text-gray-400 mb-1">
                      {worker.groups.length > 0
                        ? groups.find((group) => group.id === worker.groups[0])
                            ?.name
                        : "Sin Departamento"}
                    </p>
                    <h3 className="text-xl font-semibold mb-1">
                      {worker.user.userInfo.nombre}{" "}
                      {worker.user.userInfo.primer_apellido}
                    </h3>
                    <div className="flex justify-center items-center divide-x divide-gray-500 mt-2 text-sm">
                      <span className="px-2 text-gray-300">
                        {worker.user.email}
                      </span>
                      <span className="px-2 text-gray-300">
                        {worker.user.userInfo?.phone || "No disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white">No hay empleados disponibles.</p>
            )}
          </div>
        </section>
      </div>

      {modalCrearEmpleado && (
        <CrearEmpleadoModal
          onClose={handleCloseModal}
          onSubmit={handleCreateWorker}
          formData={formData}
          setFormData={setFormData}
          onChange={handleInputChange}
          isOpen={modalCrearEmpleado}
          firstInputRef={firstInputRef}
          groups={groups}
        />
      )}
    </div>
  );
};

export default WorkersPage;
