import React, { useState, useEffect } from "react";
import { uploadPDF, getPDF, deletePDF } from "../../services/workerService";
import { FaFilePdf, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmModal from "../ConfirmModal";

const WorkerPDFUpload = ({ workerId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [workerPdfs, setWorkerPdfs] = useState([]);
  const [adminPdfs, setAdminPdfs] = useState([]);
  const [currentPageWorker, setCurrentPageWorker] = useState(1);
  const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
  const [totalPagesAdmin, setTotalPagesAdmin] = useState(1);
  const [totalPagesWorker, setTotalPagesWorker] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);

  const fetchPDFsWorkers = async () => {
    if (!workerId) return;
    try {
      const workerData = await getPDF(workerId, currentPageWorker);

      if (workerData.error === "No hay PDFs disponibles") {
        setWorkerPdfs([]);
        setTotalPagesWorker(1);
        return;
      }
      const pdfs =
        workerData.worker_pdfs?.map((url) => ({
          url,
          date: new Date(), // Usa la fecha del backend o la actual si no hay
        })) || [];
      setWorkerPdfs(pdfs);
      setCurrentPageWorker(workerData.current_page || 1);
      setTotalPagesWorker(workerData.total_pages_worker || 1);
    } catch (error) {
      // 🚨 Aquí evitamos que salga en la consola
      if (error?.response?.data?.error !== "No hay PDFs disponibles") {
        console.error("Error al obtener los PDFs:", error);
        toast.error("Hubo un error al cargar los PDFs del empleado");
      }
    }
  };

  const fetchPDFsAdmins = async () => {
    if (!workerId) return;
    try {
      const adminData = await getPDF(workerId, currentPageAdmin);
      const pdfs = adminData.admin_pdfs || [];
      setAdminPdfs(pdfs);
      setCurrentPageAdmin(adminData.current_page || 1);
      setTotalPagesAdmin(adminData.total_pages_admin || 1);
    } catch (error) {
      console.error("Error al obtener los PDFs:", error);
      toast.error("Error al cargar los PDFs del administrador");
    }
  };
  // Obtener PDFs al cargar
  useEffect(() => {
    fetchPDFsWorkers();
    fetchPDFsAdmins();
  }, [workerId, currentPageWorker, currentPageAdmin]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      const response = await uploadPDF(workerId, file);

      const newPdf = {
        url: response.data.file_url,
        date: new Date(),
      };

      setWorkerPdfs((prev) => [...prev, newPdf]);
      setSelectedFile(null);
      fetchPDFsWorkers();
      fetchPDFsAdmins();
      toast.success("Archivo subido con éxito");
    } catch (error) {
      console.log("Error al subir archivo", error);
      toast.error("Hubo un error al subir el archivo");
    }
  };
  const handleDeletePDF = async (pdfId) => {
    try {
      await deletePDF(pdfId);
      setAdminPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== pdfId));
      fetchPDFsWorkers();
      fetchPDFsAdmins();
      toast.success("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el PDF:", error);
      toast.error("Hubo un error al subir el archivo");
    }
  };
  const openDeleteModal = (id) => {
    setPdfToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handlePrevPageWorker = () => {
    if (currentPageWorker > 1) {
      setCurrentPageWorker((prev) => prev - 1);
    }
  };

  const handleNextPageWorker = () => {
    if (currentPageWorker < totalPagesWorker) {
      setCurrentPageWorker((prev) => prev + 1);
    }
  };

  const handlePrevPageAdmin = () => {
    if (currentPageAdmin > 1) {
      setCurrentPageAdmin((prev) => prev - 1);
    }
  };

  const handleNextPageAdmin = () => {
    if (currentPageAdmin < totalPagesAdmin) {
      setCurrentPageAdmin((prev) => prev + 1);
    }
  };

  console.log(adminPdfs);

  return (
    <div className="container-proteccion-datos">
      <h1 className="title-section mt-5">Registro de Jornada</h1>

      <div className="subir-jornada">
        <h5 className="label-protecciondatos mt-2">
          Sube el archivo al empleado
        </h5>
        <input
          className="btn-datos-input mb-2"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-4">
        <h3 className="label-protecciondatos">
          Tus archivos subidos al empleado
        </h3>
        {adminPdfs.length > 0 ? (
          <div className="grid gap-3">
            {adminPdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FaFilePdf className="text-red-600 text-xl" />
                  <span className="truncate max-w-xs">
                    {pdf.url.split("/").pop()}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => openDeleteModal(pdf.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Eliminar PDF"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">
            No hay registros de jornada disponibles.
          </p>
        )}

        <div className="pagination-container">
          <div className="pagination-btn-container">
            <button
              className="pagination-flecha"
              onClick={handlePrevPageAdmin}
              disabled={currentPageAdmin === 1}
              aria-label="Página anterior"
            >
              «
            </button>

            <button className="pagination-number" aria-current="page">
              {currentPageAdmin}
            </button>

            <button
              className="pagination-flecha"
              onClick={handleNextPageAdmin}
              disabled={currentPageAdmin === totalPagesAdmin}
              aria-label="Página siguiente"
            >
              »
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="label-protecciondatos">
          Archivos subidos por el empleado
        </h3>
      </div>
      {workerPdfs.length > 0 ? (
        <div className="grid gap-3">
          {workerPdfs.map((pdf, index) => (
            <div
              key={pdf.id || index}
              className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FaFilePdf className="text-red-600 text-xl" />
                <span className="truncate max-w-xs">
                  {pdf.url.split("/").pop()}
                </span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-2">
          No hay registros de jornada disponibles.
        </p>
      )}

      <div className="pagination-container">
        <div className="pagination-btn-container">
          <button
            className="pagination-flecha"
            onClick={handlePrevPageWorker}
            disabled={currentPageWorker === 1}
            aria-label="Página anterior"
          >
            «
          </button>

          <button className="pagination-number" aria-current="page">
            {currentPageWorker}
          </button>

          <button
            className="pagination-flecha"
            onClick={handleNextPageWorker}
            disabled={currentPageWorker === totalPagesWorker}
            aria-label="Página siguiente"
          >
            »
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPdfToDelete(null);
        }}
        onConfirm={async () => {
          if (pdfToDelete) {
            await handleDeletePDF(pdfToDelete);
            setIsDeleteModalOpen(false);
            setPdfToDelete(null);
          }
        }}
        message="¿Estás seguro de que deseas eliminar este PDF?"
      />
    </div>
  );
};

export default WorkerPDFUpload;
