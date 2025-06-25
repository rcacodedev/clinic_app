import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUserIdFromToken } from "../../utils/auth";
import {
  createFormacion,
  getFormacion,
  updateFormacion,
  deleteFormacion,
} from "../../services/formacionService";
import { toast } from "react-toastify";
import CrearFormacionModal from "../../components/formacion/CrearFormacionModal";
import EditarFormacionModal from "../../components/formacion/EditarFormacionModal";

const initialFormacionData = {
  titulo: "",
  profesional: "",
  lugar: "",
  tematica: "",
  fecha_inicio: "",
  fecha_fin: "",
  hora: "",
};

const Formacion = () => {
  const [formacion, setFormacion] = useState([]);
  const [formData, setFormdata] = useState(initialFormacionData);
  const [modalCrearFormacion, setModalCrearFormacion] = useState(false);
  const [modalEditarFormacion, setModalEditarFormacion] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = getToken();
  const id = getUserIdFromToken(token);
  const firstInputRef = useRef();
  const navigate = useNavigate();

  // Obtener formaciones al cargar el componente
  const fetchFormaciones = async () => {
    try {
      const response = await getFormacion();
      setFormacion(response.results);
    } catch (error) {
      console.error("Error al obtener las formaciones", error);
      toast.error("Hubo un error al cargar las formaciones");
    }
  };

  useEffect(() => {
    fetchFormaciones();
  }, []);

  // Función para abrir el modal
  const handleCreateModal = () => {
    setFormdata(initialFormacionData);
    setModalCrearFormacion(true);
  };

  // Función para manejar los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Funcion para guardar la formación
  const handleSaveFormacion = async () => {
    try {
      const response = await createFormacion(formData);
      setFormacion([...formacion, response]);
      setModalCrearFormacion(false);
      toast.success("Se creó correctamente la formación");
    } catch (error) {
      console.error("Error al crear la formación:", error);
      toast.error("Hubo un error al crear la formación");
    }
  };

  const handleEditFormacion = async (formacion) => {
    try {
      await updateFormacion(formacion.id, formacion);
      setModalEditarFormacion(false);
      toast.success("Formación actualizada con éxito");
      fetchFormaciones();
    } catch (error) {
      console.error("Hubo un error al actualizar la formación", error);
      toast.error("Hubo un error al actualizar la Formación");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFormacion(id);
      setFormacion(formacion.filter((forma) => forma.id !== id));

      toast.success("Formacion eliminada correctamente");
      fetchFormaciones();
    } catch (error) {
      console.error("Hubo un error al eliminar la formación", error);
      toast.error("Hubo un error al eliminar la formación");
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handleOpenEditModal = (formacionItem) => {
    setFormdata(formacionItem);
    setModalEditarFormacion(true);
  };

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">Formación</h1>
        <p className="title-description">Gestiona todas tus formaciones.</p>
      </div>
      <button className="btn-primary" onClick={handleCreateModal}>
        Añadir Formación
      </button>

      <div className="table-container mt-5">
        <div className="table-subcontainer">
          <div className="table-subsubcontainer">
            <table className="table-pacientes">
              <thead className="thead-pacientes">
                <tr>
                  <th className="th-pacientes">Titulo</th>
                  <th className="th-pacientes">Lugar</th>
                  <th className="th-pacientes">Fecha de Inicio</th>
                  <th className="th-pacientes">Fecha final</th>
                  <th className="th-pacientes">Hora</th>
                  <th className="th-pacientes">Acciones</th>
                </tr>
              </thead>
              <tbody className="tbody-pacientes">
                {formacion.map((formacion) => (
                  <tr key={formacion.id} className="tbtr-pacientes">
                    <td className="tbodytd-pacientes">{formacion.titulo}</td>
                    <td className="tbodytd-formacions">{formacion.lugar}</td>
                    <td className="tbodytd-formacions">
                      {new Date(formacion.fecha_inicio).toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="tbodytd-formacions">
                      {new Date(formacion.fecha_fin).toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="tbodytd-pacientes">
                      {new Date(
                        `1970-01-01T${formacion.hora}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="btn-actions-container">
                        <button
                          className="btn-toogle"
                          onClick={() => navigate(`/formacion/${formacion.id}`)}
                        >
                          Info
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(formacion)}
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
                          onClick={() => handleDelete(formacion.id)}
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
      {modalCrearFormacion && (
        <CrearFormacionModal
          onClose={() => setModalCrearFormacion(false)}
          onSubmit={handleSaveFormacion}
          formData={formData}
          setFormdata={setFormdata}
          onChange={handleChange}
          isOpen={() => setModalCrearFormacion(true)}
          firstInputRef={firstInputRef}
        />
      )}
      {modalEditarFormacion && formData && (
        <EditarFormacionModal
          isOpen={modalEditarFormacion}
          setIsOpen={setModalEditarFormacion}
          formData={formData}
          setFormData={setFormdata}
          handleChange={handleChange}
          onSave={handleEditFormacion}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default Formacion;
