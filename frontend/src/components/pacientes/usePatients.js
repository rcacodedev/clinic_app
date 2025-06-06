import { useState, useEffect } from "react";
import { fetchPatientsService } from "../../services/patientService";

function usePatients() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { results, totalPages } = await fetchPatientsService(page, searchTerm);
      setPatients(results);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, searchTerm]);

  return {
    patients,
    page,
    totalPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    setPage,
    fetchPatients,
  };
}

export default usePatients;
