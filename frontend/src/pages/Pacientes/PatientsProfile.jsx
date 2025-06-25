import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPacientesById,
  deletePaciente,
  updatePaciente,
} from "../../services/patientService";

import UploadPDF from "../../components/pacientes/uploadPDF";
import PatientDocuments from "../../components/pacientes/patientsDocument";
import ListFacturasPatients from "../../components/facturacion/ListFacturasPacientes";
import ConfirmModal from "../../components/ConfirmModal";
import EditarPacienteModal from "../../components/pacientes/ModalEditarPaciente";
import { toast } from "react-toastify";
import PatientAppointments from "../../components/pacientes/CitasPacientes";

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
  const firstInputRef = useRef(null);

  const fetchPatientData = async () => {
    try {
      const data = await getPacientesById(id);

      // 🛠️ Normaliza patologias
      let patologias = data.patologias;
      if (typeof patologias === "string") {
        try {
          patologias = JSON.parse(patologias);
        } catch {
          patologias = [];
        }
      }
      if (!Array.isArray(patologias)) {
        patologias = [];
      }

      const cleanData = { ...data, patologias };
      setPatient(cleanData);
      setFormData(cleanData);
    } catch (error) {
      console.error("Error al obtener los datos del paciente:", error);
      toast.error("Error al obtener los datos del paciente");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPatientData();
  }, [id, refreshAppointments]); // Refrescar cuando el ID del paciente o `refreshAppointments` cambian

  // Eliminar paciente
  const handleDelete = async () => {
    try {
      await deletePaciente(id);
      toast.success("Paciente eliminado correctamente");
      navigate("/pacientes");
    } catch (error) {
      console.error("Error al eliminar el paciente:", error);
      toast.error("Error al eliminar el paciente");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Actualizar paciente
  const handleSave = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // Creamos un nuevo objeto sin los campos pdf
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

      // Aquí haces PATCH (no PUT) para no sobrescribir campos no enviados
      await updatePaciente(id, patientData);

      const updatedPatient = await getPacientesById(id);
      setPatient(updatedPatient);
      setIsEditModalOpen(false);
      fetchPatientData();
      toast.success("Paciente actualizado correctamente");
    } catch (error) {
      console.error(
        "Error al actualizar el paciente:",
        error.response?.data || error
      );
      toast.error("Error al actualizar el paciente");
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

  console.log(patient);

  return (
    <div className="main-container">
      <div className="title-container">
        <h1 className="title">
          Ficha Clínica de {patient.nombre} {patient.primer_apellido}
        </h1>
        <p className="title-description">
          Toda la información sobre el paciente {patient.nombre}{" "}
          {patient.primer_apellido}
        </p>
      </div>
      <h4 className="title-section">
        Datos personales de {patient.nombre} {patient.primer_apellido}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-lg mb-5">
        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Nombre del Paciente
          </span>
          <span className="text-base font-medium text-gray-800">
            {patient.nombre} {patient.primer_apellido}{" "}
            {patient.segundo_apellido}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Email</span>
          <span className="text-base font-medium text-gray-800">
            {patient.email}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Teléfono</span>
          <span className="text-base font-medium text-gray-800">
            {patient.phone}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">
            Fecha de nacimiento
          </span>
          <span className="text-base font-medium text-gray-800">
            {new Date(patient.fecha_nacimiento).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">DNI</span>
          <span className="text-base font-medium text-gray-800">
            {patient.dni}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Dirección</span>
          <span className="text-base font-medium text-gray-800">
            {patient.address}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Ciudad</span>
          <span className="text-base font-medium text-gray-800">
            {patient.city}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">Código Postal</span>
          <span className="text-base font-medium text-gray-800">
            {patient.code_postal}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">País</span>
          <span className="text-base font-medium text-gray-800">
            {patient.country}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-l text-gray-500 font-bold">¿Alergias?</span>
          <span className="text-base font-medium text-gray-800">
            {patient.alergias ? "Sí" : "No"}
          </span>
        </div>

        <div className="md:col-span-2 flex flex-col">
          <span className="text-l text-gray-500 font-bold">Patologías</span>
          {Array.isArray(patient.patologias) &&
          patient.patologias.length > 0 ? (
            <ul className="lista-patologias-ul">
              {patient.patologias.map((patologia, index) => (
                <li key={index}>{patologia}</li>
              ))}
            </ul>
          ) : (
            <span className="text-base font-medium text-gray-800">
              No hay patologías registradas.
            </span>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col">
          <span className="text-l text-gray-500 font-bold">Notas</span>
          <div className="bg-gray-50 p-3 rounded-md border text-gray-700 whitespace-pre-wrap">
            {patient.notas || "Sin notas registradas."}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn-primary"
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
          onClick={() => setIsDeleteModalOpen(true)}
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

      {isEditModalOpen && (
        <EditarPacienteModal
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSave}
          formData={formData}
          setFormData={setFormData}
          handleAddPathology={handleAddPathology}
          handleRemovePathology={handleRemovePathology}
          onChange={handleInputChange}
          isOpen={() => setIsEditModalOpen(true)}
          firstInputRef={firstInputRef}
        />
      )}

      {/* Modal para confirmar la eliminación del paciente */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar este paciente?"
      />
      <div className="mt-5">
        <UploadPDF patientId={id} />
        <PatientDocuments patientId={id} />
      </div>

      {/* Componente de citas */}
      <PatientAppointments
        patientId={id}
        refreshAppointments={refreshAppointments}
      />
      <ListFacturasPatients patientId={id} />
    </div>
  );
}

export default PatientProfile;
