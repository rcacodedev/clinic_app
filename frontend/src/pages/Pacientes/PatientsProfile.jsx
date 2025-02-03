import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import patientService from "../../services/patientService";
import CustomModal from "../../components/Modal";
import Boton from "../../components/Boton";
import PatientAppointments from "../../components/CitasPacientes";
import Notification from "../../components/Notification";
import "../../styles/pacientes/patientsProfile.css";

function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
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

  // const handleCitaUpdate = () => {
    // setRefreshAppointments(prev => !prev);
  // }

  // Eliminar paciente
  const handleDelete = async () => {
    try {
      await patientService.deletePatient(id);
      alert("Paciente eliminado correctamente");
      navigate("/pacientes");
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

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="patient-profile-container">
      <h1 className="profile-title">Perfil del Paciente</h1>
      <div className="patient-details">
        <p><strong>Nombre:</strong> {patient.nombre} {patient.primer_apellido} {patient.segundo_apellido}</p>
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Teléfono:</strong> {patient.phone}</p>
        <p><strong>Fecha de Nacimiento:</strong> {new Date(patient.fecha_nacimiento).toLocaleDateString()}</p>
        <p><strong>DNI:</strong> {patient.dni}</p>
        <p><strong>Dirección:</strong> {patient.address}</p>
        <p><strong>Ciudad:</strong> {patient.city}</p>
        <p><strong>Código Postal:</strong> {patient.code_postal}</p>
        <p><strong>País:</strong> {patient.country}</p>
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
          <Boton texto="Guardar Cambios" onClick={handleSave} tipo="guardar" />
        </form>
      </CustomModal>

      {/* Modal para confirmar la eliminación del paciente */}
      <CustomModal isOpen={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <p>¿Estás seguro de que quieres eliminar este perfil?</p>
        <Boton texto="Eliminar" onClick={handleDelete} tipo="peligro" />
        <Boton texto="Cancelar" onClick={() => setIsDeleteModalOpen(false)} />
      </CustomModal>

      {/* Componente de citas */}
      <PatientAppointments patientId={id} refreshAppointments={refreshAppointments} />
      <Notification
        message="Paciente Actualizado correctamente"
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
        />
    </div>
  );
}

export default PatientProfile;
