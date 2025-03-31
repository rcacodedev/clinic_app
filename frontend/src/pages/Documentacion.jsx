import React, { useState, useEffect } from "react";
import { uploadPDF, getPDF, getWorkerIdByUserId, deletePDF } from "../services/workerService";
import { getToken, getUserIdFromToken } from "../utils/auth";
import Boton from "../components/Boton";

const Documentacion = () => {
    const token = getToken();
    const userID = getUserIdFromToken(token);
    const [workerId, setWorkerId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [adminPdfs, setAdminPdfs] = useState([]);
    const [workerPdfs, setWorkerPdfs] = useState([]);
    const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
    const [currentPageWorker, setCurrentPageWorker] = useState(1);
    const [totalPagesAdmin, setTotalPagesAdmin] = useState(1);
    const [totalPagesWorker, setTotalPagesWorker] = useState(1);

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

    const fetchPDFsAdmin = async () => {
        if (!workerId) return;
        try {
            const adminData = await getPDF(workerId, currentPageAdmin);
            const pdfs = adminData.admin_pdfs?.map(url => ({
                url,
                date: new Date()
            })) || [];
            setAdminPdfs(pdfs);
            setCurrentPageAdmin(adminData.current_page || 1);
            setTotalPagesAdmin(adminData.total_pages_admin || 1);
        } catch (error) {
            console.error("Error al obtener los Admin PDFs:", error);
        }
    };
    const fetchPDFsWorkers = async () => {
        if (!workerId) return;
        try {
            const workerData = await getPDF(workerId, currentPageWorker);
            const pdfs = workerData.worker_pdfs?.map((url, index) =>({
                id: index + 1,
                url: url,
                date: new Date()
            })) || [];
            setWorkerPdfs(pdfs);
            setCurrentPageWorker(workerData.current_page || 1);
            setTotalPagesWorker(workerData.total_pages_worker || 1);
        } catch (error) {
            console.error("Error al obtener tus PDFs:", error)
        }
    };

    useEffect(() => {
        fetchPDFsAdmin();
        fetchPDFsWorkers();
    }, [workerId, currentPageAdmin, currentPageWorker]);

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
            fetchPDFsAdmin();
            fetchPDFsWorkers();
        } catch (error) {
            alert("Error al subir el PDF: " + (error?.response?.data?.message || "Error desconocido"));
        }
    };

    const handleDeletePDF = async (pdfId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este PDF?");
        if (!confirmDelete) return;

        try {
            await deletePDF(pdfId)
            setWorkerPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.id !== pdfId));
            fetchPDFsAdmin();
            fetchPDFsWorkers();
        } catch (error) {
            console.error("Error al eliminar el PDF:", error)
        }
    }

    const handlePrevPageAdmin = () => {
        if (currentPageAdmin > 1) {
            setCurrentPageAdmin(prev => prev - 1);
        }
    };

    const handleNextPageAdmin = () => {
        if (currentPageAdmin < totalPagesAdmin) {
            setCurrentPageAdmin(prev => prev + 1);
        }
    };

    const handlePrevPageWorker = () => {
        if (currentPageWorker > 1) {
            setCurrentPageWorker(prev => prev - 1);
        }
    };

    const handleNextPageWorker = () => {
        if (currentPageWorker < totalPagesWorker) {
            setCurrentPageWorker(prev => prev + 1);
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
                <Boton onClick={handlePrevPageAdmin} disabled={currentPageAdmin === 1} texto="Anterior"/>
                <span>{currentPageAdmin}</span>
                <Boton onClick={handleNextPageAdmin} disabled={currentPageAdmin === totalPagesAdmin} texto="Siguiente" />
            </div>

            <div className="subir-jornada">
                <h3>Subir PDF de Registro de Jornada</h3>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <Boton onClick={handleUpload} texto="Subir PDF" />
            </div>
            <div className="descargar-jornada">
                <h3>Tus registros de jornada</h3>
                {workerPdfs.map((pdf, index) => (
                    <div key={index}>
                        <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                            Descargar Registro Jornada ({pdf.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})
                        </a>
                        <Boton texto="Eliminar" onClick={() => handleDeletePDF(pdf.id)} />
                    </div>
                ))}
               <div className="paginacion">
                   <Boton onClick={handlePrevPageWorker} disabled={currentPageWorker === 1} texto="Anterior"/>
                    <span>{currentPageWorker}</span>
                    <Boton onClick={handleNextPageWorker} disabled={currentPageWorker === totalPagesWorker} texto="Siguiente" />
               </div>
            </div>
        </div>
    );
};

export default Documentacion;
