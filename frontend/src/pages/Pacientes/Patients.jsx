import React, { useState, useEffect } from "react";
import { deletePaciente, getPacientes } from "../../services/patientService";
import PatientList from "../../components/pacientes/patientsList";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPacientes();
        setPatients(data.results); // Si tienes paginación
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Eliminar paciente
  const handleDelete = async (id) => {
    try {
      await deletePaciente(id);
      setPatients(patients.filter((patient) => patient.id !== id)); // Actualiza la lista
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
    }
  };

  // Función para refrescar la lista de pacientes después de una edición
  const handleEditSuccess = () => {
    // Aquí, no necesitamos recargar los pacientes otra vez manualmente,
    // ya que la lista ya está siendo manejada por el estado de `Patients`
    const fetchPatients = async () => {
      try {
        const data = await getPacientes();
        setPatients(data.results); // Actualiza la lista de pacientes
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    };
    fetchPatients();
  };

  if (loading) return <p>Cargando pacientes...</p>;

  return (
      <PatientList
      patients={patients}
      onDelete={handleDelete}
      onEditSuccess={handleEditSuccess}
      />
  );
};

export default Patients;
