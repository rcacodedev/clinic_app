import React, { useState, useEffect } from "react";
import { uploadPDF, getPDF, getWorkerIdByUserId } from "../services/workerService";
import { getToken, getUserIdFromToken } from "../utils/auth";

const Documentacion = () => {
    const token = getToken();
    const userID = getUserIdFromToken(token);
    const [workerId, setWorkerId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [adminPdfs, setAdminPdfs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPagesAdmin, setTotalPagesAdmin] = useState(1);

    useEffect(() => {
        const fetchWorkerID = async () => {
            if (userID) {
                const workerId = await getWorkerIdByUserId(userID);
                setWorkerId(workerId);
            }
        };

        if (userID) {
            fetchWorkerID();
        }
    }, [userID]);

    useEffect(() => {
        const fetchPDFs = async () => {
            if (!workerId) return;
            try {
                const adminData = await getPDF(workerId, currentPage);
                const pdfs = adminData.admin_pdfs?.map(url => ({
                    url,
                    date: new Date()
                })) || [];
                setAdminPdfs(pdfs);
                setCurrentPage(adminData.current_page || 1);
                setTotalPagesAdmin(adminData.total_pages_admin || 1);
            } catch (error) {
                console.error("Error al obtener los PDFs:", error);
            }
        };
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

            const newPdf = {
                url: response.data.file_url,
                date: new Date()
            };

            setAdminPdfs([...adminPdfs, newPdf]);
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
        if (currentPage < totalPagesAdmin) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="container-registrojornada">
            <h1>Registro de Jornada</h1>

            {adminPdfs.length > 0 && (
                <div className="descargar-jornada">
                    <h3>Descargar PDF subido por Admin</h3>
                    {adminPdfs.map((pdf, index) => (
                        <div key={index}>
                            <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                                Descargar Registro Jornada ({pdf.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})
                            </a>
                        </div>
                    ))}
                </div>
            )}

            <div className="paginacion">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Anterior
                </button>
                <span>{currentPage}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPagesAdmin}>
                    Siguiente
                </button>
            </div>

            <div className="subir-jornada">
                <h3>Subir PDF de Registro de Jornada</h3>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button onClick={handleUpload}>Subir PDF</button>
            </div>
        </div>
    );
};

export default Documentacion;
