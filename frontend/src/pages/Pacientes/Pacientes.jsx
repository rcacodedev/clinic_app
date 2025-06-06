import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPacientes,
  deletePaciente,
  crearPaciente,
  updatePaciente,
  uploadSignedPDFs,
} from "../../services/patientService";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";
import CrearPacienteModal from "../../components/pacientes/ModalCrearPaciente";
import EditarPacienteModal from "../../components/pacientes/ModalEditarPaciente";

const initialFormData = {
  alergias: false,
  patologias: [],
  // agrega aquí los demás campos si los tienes, por ejemplo:
  nombre: "",
  primer_apellido: "",
  segundo_apellido: "",
  dni: "",
  fecha_nacimiento: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  code_postal: "",
  country: "",
  notas: "",
  pdf_firmado_general: null,
  pdf_firmado_menor: null,
};

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalCrearPaciente, setModalCrearPaciente] = useState(false);
  const [modalEditarPaciente, setModalEditarPaciente] = useState(false);
  const [modalEliminarPaciente, setModalEliminarPaciente] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const firstInputRef = useRef(null);
  const navigate = useNavigate();

  // Cargar Pacientes
  const fetchPacientes = async () => {
    try {
      const data = await getPacientes({ page, searchTerm });
      setPacientes(data.results);
      setTotalPages(Math.ceil(data.count / 8));
    } catch (error) {
      console.error("Error al cargar la lista de pacientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes(page, searchTerm);
  }, [page, searchTerm]);

  const handleDeleteClick = (id) => {
    setSelectedPaciente(id);
    setModalEliminarPaciente(true);
  };
  // Función para eliminar paciente
  const handleDelete = async (id) => {
    try {
      await deletePaciente(id);
      setPacientes(pacientes.filter((paciente) => paciente.id !== id));
      toast.success("Paciente eliminado correctamente");
      fetchPacientes();
    } catch (error) {
      console.error("Error al eliminar al paciente:", error);
      toast.error("Error al eliminar al paciente");
    } finally {
      setModalEliminarPaciente(false);
      setSelectedPaciente(null);
    }
  };

  const confirmDelete = () => {
    if (selectedPaciente) {
      handleDelete(selectedPaciente);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reiniciar a página 1 al buscar
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Manejar la adición de nuevas patologías
  const handleAddPathology = () => {
    const newPathology = prompt("Ingresa una nueva patología:");
    if (newPathology) {
      setFormData((prevState) => {
        const updatedFormData = {
          ...prevState,
          patologias: prevState.patologias
            ? [...prevState.patologias, newPathology]
            : [newPathology],
        };
        return updatedFormData;
      });
    }
  };

  // Elimina una patología
  const handleRemovePathology = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      patologias: prevState.patologias.filter((_, i) => i !== index),
    }));
  };

  // Función para manejar el cambio de los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();

    const patientFormData = new FormData();
    // Añadir datos del paciente, serializando 'patologias'
    Object.keys(formData).forEach((key) => {
      if (key !== "pdf_firmado_general" && key !== "pdf_firmado_menor") {
        if (key === "patologias") {
          patientFormData.append(
            "patologias",
            JSON.stringify(formData.patologias || [])
          );
        } else {
          patientFormData.append(key, formData[key]);
        }
      }
    });

    // Añadir archivos PDF si existen
    if (formData.pdf_firmado_general) {
      patientFormData.append(
        "pdf_firmado_general",
        formData.pdf_firmado_general
      );
    }
    if (formData.pdf_firmado_menor) {
      patientFormData.append("pdf_firmado_menor", formData.pdf_firmado_menor);
    }

    try {
      const newPatient = await crearPaciente(patientFormData);
      if (formData.pdf_firmado_general || formData.pdf_firmado_menor) {
        await uploadSignedPDFs(newPatient.id, patientFormData);
      }
      fetchPacientes(page, searchTerm);
      setModalCrearPaciente(false);
      toast.success("Paciente creado con éxito");
    } catch (error) {
      console.error("Error añadiendo paciente:", error);
      toast.error("Error al añadir el paciente");
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();

    // Construimos un objeto con los datos a enviar
    const patientData = {};

    Object.keys(formData).forEach((key) => {
      if (key !== "pdf_firmado_general" && key !== "pdf_firmado_menor") {
        if (key === "patologias") {
          patientData.patologias = JSON.stringify(formData.patologias || []);
        } else {
          patientData[key] = formData[key];
        }
      }
    });

    try {
      await updatePaciente(formData.id, patientData); // enviamos objeto simple, no FormData
      fetchPacientes(page, searchTerm);
      setModalEditarPaciente(false);
      toast.success("Paciente editado correctamente");
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
      toast.error("Error al editar el paciente");
    }
  };

  const abrirModalEditar = (paciente) => {
    const patologiasParsed =
      typeof paciente.patologias === "string"
        ? JSON.parse(paciente.patologias)
        : paciente.patologias || [];

    setFormData({
      ...paciente,
      patologias: patologiasParsed,
    });
    setModalEditarPaciente(true);
  };

  const abrirModalCrearPaciente = () => {
    setFormData(initialFormData); // limpiar el formulario
    setModalCrearPaciente(true); // mostrar el modal
  };

  if (loading) return <p className="text-center py-4">Cargando pacientes...</p>;

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Pacientes</h1>
        <p className="title-description">
          Gestión y búsqueda de pacientes registrados.
        </p>
      </div>
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
            onChange={handleSearch}
            className="input-search"
          />
        </div>

        {/* Botón para añadir paciente */}
        <button className="btn-primary" onClick={abrirModalCrearPaciente}>
          Añadir Paciente
        </button>
      </div>
      <div className="table-container">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            <table className="table-pacientes">
              <thead className="thead-pacientes">
                <tr>
                  <th className="th-pacientes">Nombre</th>
                  <th className="th-pacientes">Teléfono</th>
                  <th className="th-pacientes">Email</th>
                  <th className="th-pacientes">Fecha Nacimiento</th>
                  <th className="th-pacientes">DNI</th>
                  <th className="th-pacientes">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody-pacientes">
                {pacientes.map((paciente) => (
                  <tr key={paciente.id} className="tbtr-pacientes">
                    <td className="tbodytd-pacientes">
                      {paciente.nombre} {paciente.primer_apellido}{" "}
                      {paciente.segundo_apellido}
                    </td>
                    <td className="tbodytd-pacientes">{paciente.phone}</td>
                    <td className="tbodytd-pacientes">{paciente.email}</td>
                    <td className="tbodytd-pacientes">
                      {paciente.fecha_nacimiento}
                    </td>
                    <td className="tbodytd-pacientes">{paciente.dni}</td>
                    <td className="px-6 py-4">
                      <div className="btn-actions-container">
                        <button
                          className="btn-toogle"
                          onClick={() => navigate(`/pacientes/${paciente.id}`)}
                        >
                          Perfil
                        </button>
                        <button
                          onClick={() => abrirModalEditar(paciente)}
                          className="btn-toogle"
                        >
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
                          className="btn-toogle"
                          onClick={() => handleDeleteClick(paciente.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <span className="span-pagination">
              Página {page} de {totalPages}
            </span>
            <div className="pagination-btn-container">
              <button
                className="pagination-flecha"
                onClick={handlePrevPage}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                «
              </button>

              <button className="pagination-number" aria-current="page">
                {page}
              </button>

              <button
                className="pagination-flecha"
                onClick={handleNextPage}
                disabled={page === totalPages}
                aria-label="Página siguiente"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
      {modalCrearPaciente && (
        <CrearPacienteModal
          onClose={() => setModalCrearPaciente(false)}
          onSubmit={handleAddPatient}
          formData={formData}
          setFormData={setFormData}
          handleAddPathology={handleAddPathology}
          onChange={handleInputChange}
          handleRemovePathology={handleRemovePathology}
          isOpen={() => setModalCrearPaciente(true)}
          firstInputRef={firstInputRef}
        />
      )}

      {modalEditarPaciente && (
        <EditarPacienteModal
          onClose={() => setModalEditarPaciente(false)}
          onSubmit={handleEditPatient}
          formData={formData}
          setFormData={setFormData}
          handleAddPathology={handleAddPathology}
          handleRemovePathology={handleRemovePathology}
          onChange={handleInputChange}
          isOpen={() => setModalEditarPaciente(true)}
          firstInputRef={firstInputRef}
        />
      )}
      <ConfirmModal
        isOpen={modalEliminarPaciente}
        onClose={() => setModalEliminarPaciente(false)}
        onConfirm={confirmDelete}
        message="¿Estás seguro de que deseas eliminar este paciente?"
      />
    </div>
  );
};

export default Pacientes;
