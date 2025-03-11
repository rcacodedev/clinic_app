import React, { useState, useEffect } from "react";
import { uploadPDF, getPDF, deletePDF } from "../../services/workerService";
import Boton from '../Boton'
import "../../styles/Workers/registrojornada.css";
import Notification from "../Notification";

const WorkerPDFUpload = ({ workerId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [workerPdfs, setWorkerPdfs] = useState([]);
    const [adminPdfs, setAdminPdfs] = useState([]);
    const [currentPageWorker, setCurrentPageWorker] = useState(1);
    const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
    const [totalPagesAdmin, setTotalPagesAdmin] = useState(1);
    const [totalPagesWorker, setTotalPagesWorker] = useState(1);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);


    // Obtener PDFs al cargar
    useEffect(() => {
        const fetchPDFsWorkers = async () => {
            if (!workerId) return;
            try {
                const workerData = await getPDF(workerId, currentPageWorker);

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
                setCurrentPageWorker(workerData.current_page || 1);
                setTotalPagesWorker(workerData.total_pages_worker || 1);
            } catch (error) {
                 // 🚨 Aquí evitamos que salga en la consola
                if (error?.response?.data?.error !== "No hay PDFs disponibles") {
                    console.error("Error al obtener los PDFs:", error);
                }
            }
        }

        const fetchPDFsAdmins = async () => {
            if (!workerId) return;
            try {
                const adminData = await getPDF(workerId, currentPageAdmin);
                const pdfs = adminData.admin_pdfs?.map((url, index) => ({
                    id: index +1,
                    url: url,
                    date: new Date()
                })) || [];
                setAdminPdfs(pdfs);
                setCurrentPageAdmin(adminData.current_page || 1);
                setTotalPagesAdmin(adminData.total_pages_admin || 1);
            } catch (error) {
                console.error("Error al obtener los PDFs:", error);
            }
        };

        fetchPDFsWorkers();
        fetchPDFsAdmins();
    }, [workerId, currentPageWorker, currentPageAdmin]);

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
            setIsNotificationVisible(true);
            setSelectedFile(null);
        } catch (error) {
            alert("Error al subir el PDF: " + (error?.response?.data?.message || "Error desconocido"));
        }
    };

    const handleDeletePDF = async (pdfId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este PDF?");
        if (!confirmDelete) return;

        try {
            await deletePDF(pdfId)
            setAdminPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.id !== pdfId));
        } catch (error) {
            console.error("Error al eliminar el PDF:", error)
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

    return (
        <div className="container-registrojornada">
            <h1>Registro de Jornada</h1>

            <div className="subir-jornada">
                <h3>Subir PDF de Registro de Jornada</h3>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <Boton texto="Subir PDF" onClick={handleUpload} tipo="guardar" />
            </div>

            <div className="lista-registro-admin">
                <h3>Tus Registros de jornada subidos</h3>
                {adminPdfs.length > 0 ? (
                <div className="descargar-jornada">
                    {adminPdfs.map((pdf, index) => (
                        <div key={index}>
                            <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                                Descargar Registro Jornada ({pdf.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})
                            </a>
                            <Boton texto="Eliminar" onClick={() => handleDeletePDF(pdf.id)} />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay registros de jornada disponibles.</p>
            )}

            <div className="paginacion">
                <Boton onClick={handlePrevPageAdmin} disabled={currentPageAdmin === 1} texto="Anterior" />
                <span>{currentPageAdmin}</span>
                <Boton onClick={handleNextPageAdmin} disabled={currentPageAdmin === totalPagesAdmin} texto="Siguiente"/>
            </div>
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
                <Boton onClick={handlePrevPageWorker} disabled={currentPageWorker === 1 } texto="Anterior" />
                <span>{currentPageWorker}</span>
                <Boton onClick={handleNextPageWorker} disabled={currentPageWorker === totalPagesWorker} texto="Siguiente" />
            </div>
            <Notification
                message="Registro de Jornada enviado correctamente"
                isVisible={isNotificationVisible}
                onClose={() => setIsNotificationVisible(false)}
                />
        </div>
    );
};

export default WorkerPDFUpload;
