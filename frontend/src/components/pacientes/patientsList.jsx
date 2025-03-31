import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import patientService from "../../services/patientService"; // Para interactuar con los pacientes
import Boton from "../Boton";
import CustomModal from "../Modal"; // Modal personalizado
import Notification from "../Notification";
import '../../styles/pacientes/patients.css';

function PatientList({ onEditSuccess }) {
  const [patients, setPatients] = useState([]); // Pacientes actuales
  const [page, setPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [isLoading, setIsLoading] = useState(false); // Cargando
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false); // Modal de añadir paciente
  const [formData, setFormData] = useState({
    alergias: false,
    patologias: [],
  });
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const firstInputRef = useRef(null);

  const navigate = useNavigate(); // Hook de navegación



  // Función para obtener pacientes de la API
  const fetchPatients = async (page, searchTerm) => {
    setIsLoading(true);
    try {
      const response = await patientService.getPatients({ page, searchTerm }); // Llamada al servicio con los parámetros
      setPatients(response.results);
      setTotalPages(Math.ceil(response.count / 10)); // Calcular el total de páginas
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(page, searchTerm); // Llamar a la función fetchPatients al cargar el componente
  }, [page, searchTerm]); // Cada vez que la página o el término de búsqueda cambie, volver a cargar los pacientes

  useEffect(() => {
    if (isAddPatientModalOpen) {
      const firstInput = firstInputRef.current;
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus();
        }, 100); // Espera de 100ms
      }
    }
  }, [isAddPatientModalOpen]); // Este efecto solo se ejecutará cuando se abra el modal

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Función para abrir el modal de añadir paciente
  const openAddPatientModal = () => {
    setFormData({}); // Limpiar el formulario
    setIsAddPatientModalOpen(true);
  };

  // Función para cerrar el modal de añadir paciente
  const closeAddPatientModal = () => {
    setIsAddPatientModalOpen(false);
  };


// Manejar la adición de nuevas patologías
const handleAddPathology = () => {
  const newPathology = prompt("Ingresa una nueva patología:");
  if (newPathology) {
    setFormData((prevState) => {
      const updatedFormData = {
        ...prevState,
        patologias: prevState.patologias ? [...prevState.patologias, newPathology] : [newPathology],
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
    try {
      await patientService.createPatient(formData);  // Método para crear paciente en el servicio
      onEditSuccess();  // Actualizar la lista de pacientes
      closeAddPatientModal(); // Cerrar el modal de añadir
      fetchPatients(page, searchTerm); // Actualizar la lista de pacientes después de añadir uno
      setIsNotificationVisible(true);
    } catch (error) {
      console.error('Error añadiendo paciente:', error);
      alert('Error al añadir el paciente');
    }
  };

  // Función para redirigir al perfil del paciente
  const goToPatientProfile = (patientId) => {
    navigate(`/api/pacientes/${patientId}`);  // Navega a la ruta del perfil del paciente
  };


  return (
    <div className="patient-list-container">
      <h1 className="title">Lista de Pacientes</h1>

      {/* Campo de búsqueda */}

      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar Pacientes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="add-button-container">
          <Boton texto="Añadir Paciente" onClick={openAddPatientModal} />
        </div>
      </div>

      <table className="patient-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Fecha de Nacimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.nombre} {patient.primer_apellido} {patient.segundo_apellido}</td>
              <td>{patient.phone}</td>
              <td>{patient.email}</td>
              <td>{patient.fecha_nacimiento}</td>
              <td>
                <Boton texto="Ver Perfil" onClick={() => goToPatientProfile(patient.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isLoading && <p>Cargando...</p>}

      {/* Paginación */}
      <div className="pagination">
        <Boton texto="Anterior" onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
        <span>Página {page} de {totalPages}</span>
        <Boton texto="Siguiente" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
      </div>

      {/* Modal para añadir un paciente usando CustomModal */}
      <CustomModal
        isOpen={isAddPatientModalOpen}
        onRequestClose={closeAddPatientModal}
        title="Añadir Paciente"
      >
        <form onSubmit={handleAddPatient}>
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={formData.nombre || ''}
            onChange={handleInputChange}
            placeholder="Nombre"
            ref={firstInputRef}  // Referencia al primer input
            tabIndex="1"
            autoFocus
          />
          <label htmlFor="primer_apellido">Primer Apellido</label>
          <input
            type="text"
            name="primer_apellido"
            id="primer_apellido"
            value={formData.primer_apellido || ''}
            onChange={handleInputChange}
            placeholder="Primer Apellido"
            tabIndex="2"
          />
          <label htmlFor="segundo_apellido">Segundo Apellido</label>
          <input
            type="text"
            name="segundo_apellido"
            id="segundo_apellido"
            value={formData.segundo_apellido || ''}
            onChange={handleInputChange}
            placeholder="Segundo Apellido"
            tabIndex="3"
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            placeholder="Email"
            tabIndex="4"
          />
          <label htmlFor="phone">Teléfono</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="Teléfono"
            tabIndex="5"
          />
          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            id="fecha_nacimiento"
            value={formData.fecha_nacimiento || ''}
            onChange={handleInputChange}
            placeholder="Fecha de Nacimiento"
            tabIndex="6"
          />
          <label htmlFor="dni">DNI/NIF</label>
          <input
            type="text"
            name="dni"
            id="dni"
            value={formData.dni || ''}
            onChange={handleInputChange}
            placeholder="DNI o NIF"
            tabIndex="6"
          />
          <label htmlFor="address">Dirección</label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            placeholder="Dirección"
            tabIndex="6"
          />
          <label htmlFor="city">Ciudad</label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.city || ''}
            onChange={handleInputChange}
            placeholder="Ciudad"
            tabIndex="6"
          />
          <label htmlFor="code_postal">Código Postal</label>
          <input
            type="text"
            name="code_postal"
            id="code_postal"
            value={formData.code_postal || ''}
            onChange={handleInputChange}
            placeholder="Código postal"
            tabIndex="6"
          />
          <label htmlFor="country">País</label>
          <input
            type="text"
            name="country"
            id="country"
            value={formData.country || ''}
            onChange={handleInputChange}
            placeholder="País"
            tabIndex="6"
          />
          <label>Patologías</label>
          <div className="pathologies-container">
            {formData.patologias && formData.patologias.length > 0 ? (
              <ul>
                {formData.patologias.map((pathology, index) => (
                  <li key={index}>
                    {pathology} <button type="button" onClick={() => handleRemovePathology(index)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se han añadido patologías aún.</p>
            )}
            <button className="button-pathology" type="button" onClick={handleAddPathology}>Añadir Patología</button>
          </div>
          <label>Alergias</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{formData.alergias ? "Sí" : "No"}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.alergias}
                onChange={() => setFormData({ ...formData, alergias: !formData.alergias })}
              />
              <span className="slider"></span>
            </label>
          </div>
          <Boton texto="Guardar" onClick={handleAddPatient} tipo="guardar" />
        </form>
      </CustomModal>
      <Notification
        message="Paciente añadido correctamente."
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
        type="success"
      />
    </div>
  );
}

export default PatientList;
