import React, { useState, useEffect } from "react";
import { uploadPDF, getPDF } from "../../services/workerService";
import "../../styles/Workers/registrojornada.css";

const WorkerPDFUpload = ({ workerId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [workerPdfs, setWorkerPdfs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPagesWorker, setTotalPagesWorker] = useState(1);

    // Obtener PDFs al cargar
    useEffect(() => {
        const fetchPDFs = async () => {
            if (!workerId) return;
            try {
                const workerData = await getPDF(workerId, currentPage);

                if (workerData.error === "No hay PDFs disponibles") {
                    setWorkerPdfs([]);
                    setTotalPagesWorker(1);
                    return;
                }
                const pdfs = workerData.worker_pdfs?.map(url => ({
                    url,
                    date: new Date() // Usa la fecha del backend o la actual si no hay
                })) || [];
                setWorkerPdfs(pdfs);
                setCurrentPage(workerData.current_page || 1);
                setTotalPagesWorker(workerData.total_pages_worker || 1);
            } catch (error) {
                 // 🚨 Aquí evitamos que salga en la consola
                if (error?.response?.data?.error !== "No hay PDFs disponibles") {
                    console.error("Error al obtener los PDFs:", error);
                }
            }
        }
        fetchPDFs();
    }, [workerId, currentPage]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Por favor selecciona un archivo PDF.");
            return;
        }

        try {
            const response = await uploadPDF(workerId, selectedFile);
            alert("PDF subido con éxito");

            // Guardamos la URL y la fecha actual
            const newPdf = {
                url: response.data.file_url,
                date: new Date() // Tomamos la fecha actual
            };

            setWorkerPdfs([...workerPdfs, newPdf]);
            setSelectedFile(null);
        } catch (error) {
            alert("Error al subir el PDF: " + (error?.response?.data?.message || "Error desconocido"));
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPagesWorker) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="container-registrojornada">
            <h1>Registro de Jornada</h1>

            <div className="subir-jornada">
                <h3>Subir PDF de Registro de Jornada</h3>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button onClick={handleUpload}>Subir PDF</button>
            </div>

            {workerPdfs.length > 0 ? (
                <div className="descargar-jornada">
                    <h3>Descargar PDF subido por el Worker</h3>
                    {workerPdfs.map((pdf, index) => (
                        <div key={index}>
                            <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                                Descargar Registro Jornada ({pdf.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay registros de jornada disponibles.</p>
            )}

            <div className="paginacion">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Anterior
                </button>
                <span>{currentPage}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPagesWorker}>
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default WorkerPDFUpload;
