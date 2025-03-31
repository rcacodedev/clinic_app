import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import patientService from "../../services/patientService";
import CustomModal from "../../components/Modal";
import Boton from "../../components/Boton";
import PatientAppointments from "../../components/pacientes/CitasPacientes";
import Notification from "../../components/Notification";
import UploadPDF from "../../components/pacientes/uploadPDF";
import PatientDocuments from "../../components/pacientes/patientsDocument";
import ListFacturasPatients from "../../components/facturacion/ListFacturasPacientes";
import "../../styles/pacientes/patientsProfile.css";

function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patologias: [],
  });
  const [refreshAppointments, setRefreshAppointments] = useState(false); // Para refrescar las citas
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const data = await patientService.getPatientById(id);
        setPatient(data);
        setFormData(data);
      } catch (error) {
        console.error("Error al obtener los datos del paciente:", error);
        setError("Error al cargar los datos del paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id, refreshAppointments]); // Refrescar cuando el ID del paciente o `refreshAppointments` cambian

  // Eliminar paciente
  const handleDelete = async () => {
    try {
      await patientService.deletePatient(id);
      alert("Paciente eliminado correctamente");
      navigate("/api/pacientes");
    } catch (error) {
      console.error("Error al eliminar el paciente:", error);
      alert("Error al eliminar el paciente");
    }
  };

  // Actualizar paciente
  const handleSave = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await patientService.updatePatient(id, formData);
      const updatedPatient = await patientService.getPatientById(id);
      setPatient(updatedPatient);
      setIsEditModalOpen(false);
      setIsNotificationVisible(true);
    } catch (error) {
      console.error("Error al actualizar el paciente:", error);
      alert("Error al actualizar el paciente");
    } finally {
      setLoading(false);
    }
  };

  // Función para añadir patologías
  const handleAddPathology = () => {
    const newPathology = prompt("Ingresa una nueva patología:");
    if (newPathology) {
      setFormData((prevState) => ({
        ...prevState,
        patologias: [...prevState.patologias, newPathology],
      }));
    }
  };

  // Función para eliminar patologías
  const handleRemovePathology = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      patologias: prevState.patologias.filter((_, i) => i !== index),
    }));
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="patient-profile-container">
      <h1 className="profile-title">Perfil del Paciente</h1>
      <div className="patient-details">
        <div className="patient-field"><strong>Nombre:</strong><span>{patient.nombre} {patient.primer_apellido} {patient.segundo_apellido}</span></div>
        <div className="patient-field"><strong>Email:</strong><span>{patient.email}</span></div>
        <div className="patient-field"><strong>Teléfono:</strong><span>{patient.phone}</span></div>
        <div className="patient-field"><strong>Fecha de nacimiento:</strong><span>{new Date(patient.fecha_nacimiento).toLocaleDateString()}</span></div>
        <div className="patient-field"><strong>DNI:</strong><span>{patient.dni}</span></div>
        <div className="patient-field"><strong>Dirección:</strong><span>{patient.address}</span></div>
        <div className="patient-field"><strong>Ciudad:</strong><span>{patient.city}</span></div>
        <div className="patient-field"><strong>Código Postal:</strong><span>{patient.code_postal}</span></div>
        <div className="patient-field"><strong>País:</strong><span>{patient.country}</span></div>
        <div className="patient-field"><strong>Alergías:</strong><span>{patient.alergias ? "Sí" : "No"}</span></div>
        <div className="patient-field"><strong>Patologías:</strong>
          {Array.isArray(patient.patologias) && patient.patologias.length > 0 ? (
            <ul className="no-bullets">
              {patient.patologias.map((patologia, index) => (
                <li key={index}>{patologia}</li>
              ))}
            </ul>
          ) : (
            <span>No hay patologías registradas.</span>
          )}
        </div>
        <div className="patient-field patient-notes"><strong>Notas:</strong><span>{patient.notas}</span></div>
      </div>

      <Boton  texto="Editar Perfil" onClick={() => setIsEditModalOpen(true)} />
      <Boton  texto="Eliminar Perfil" onClick={() => setIsDeleteModalOpen(true)} tipo="peligro"/>

      {/* Modal para editar el paciente */}
      <CustomModal isOpen={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)} title="Editar Perfil del Paciente">
        <form className="edit-form">
          <label>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          <label>Primer Apellido</label>
          <input type="text" name="primer_apellido" value={formData.primer_apellido || ''} onChange={e => setFormData({...formData, primer_apellido: e.target.value})} />
          <label>Segundo Apellido</label>
          <input type="text" name="segundo_apellido" value={formData.segundo_apellido || ''} onChange={e => setFormData({...formData, segundo_apellido: e.target.value})} />
          <label>Email</label>
          <input type="email" name="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          <label>Telefono</label>
          <input type="text" name="phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <label>Fecha de nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} />
          <label>DNI/NIF</label>
          <input type="text" name="dni" value={formData.dni || ''} onChange={e => setFormData({...formData, dni: e.target.value})} />
          <label>Dirección</label>
          <input type="text" name="address" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
          <label>Ciudad</label>
          <input type="text" name="city" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
          <label>Código Postal</label>
          <input type="text" name="code_postal" value={formData.code_postal || ''} onChange={e => setFormData({...formData, code_postal: e.target.value})} />
          <label>País</label>
          <input type="text" name="country" value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} />
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
            <button type="button" onClick={handleAddPathology}>Añadir Patología</button>
          </div>
          <label>Alergías</label>
          <div style={{display: "flex", alignItems:"center", gap:"10px"}}>
            <span>{formData.alergias ? "Sí" : "No"}</span>
            <label className="switch">
              <input type="checkbox" checked={formData.alergias} onChange={() => setFormData({...formData, alergias: !formData.alergias})} />
              <span className="slider"></span>
            </label>
          </div>
          <label htmlFor="notas">Notas:</label>
          <textarea
            name="notas"
            value={formData.notas || ""}
            onChange={e => setFormData({...formData, notas: e.target.value})}
            placeholder="Escribe notas sobre el paciente..."
          />
          <Boton texto="Guardar Cambios" onClick={handleSave} tipo="guardar" />
        </form>
      </CustomModal>

      {/* Modal para confirmar la eliminación del paciente */}
      <CustomModal isOpen={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <p>¿Estás seguro de que quieres eliminar este perfil?</p>
        <Boton texto="Eliminar" onClick={handleDelete} tipo="peligro" />
        <Boton texto="Cancelar" onClick={() => setIsDeleteModalOpen(false)} />
      </CustomModal>
      <div className="proteccion-datos">
        <UploadPDF patientId={id} />
        <PatientDocuments patientId={id} />
      </div>


      {/* Componente de citas */}
      <PatientAppointments patientId={id} refreshAppointments={refreshAppointments} />
      <Notification
        message="Perfil actualizado correctamente"
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
      />
      <ListFacturasPatients patientId={id} />
    </div>
  );
}

export default PatientProfile;
