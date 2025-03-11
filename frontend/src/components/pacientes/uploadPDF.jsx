import { useState, useEffect } from "react";
import patientService from "../../services/patientService";
import { FaFilePdf } from 'react-icons/fa'; // Importar el icono de PDF
import Boton from "../Boton";
import Notification from "../Notification";
import '../../styles/pacientes/uploadpdf.css'

const UploadPDF = ({ patientId }) => {
  const [selectedFiles, setSelectedFiles] = useState({
    pdf_firmado_general: null,
    pdf_firmado_menor: null,
    pdf_firmado_inyecciones: null,
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfUrls, setPdfUrls] = useState({});
  const [patient, setPatient] = useState({ pdf_firmado_general: "", pdf_firmado_menor: "", pdf_firmado_inyecciones: "" });
  const [isNotificationVisibleSubir, setIsNotificationVisibleSubir] = useState(false);

  const loadPatientsData = async () => {
    try {
        const response = await patientService.getPatientById(patientId)
        setPatient(response)
    } catch (error) {
        console.error("Error al obtener los datos del paciente:", error);
    }
  };

  useEffect(() => {
    loadPatientsData();
  }, [patientId])

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [name]: files[0],
    }));
  };

  const handleUpload = async () => {
    if (!selectedFiles.pdf_firmado_general && !selectedFiles.pdf_firmado_menor && !selectedFiles.pdf_firmado_inyecciones) {
      setMessage("Por favor, selecciona al menos un archivo PDF.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const response = await patientService.uploadSignedPDFs(patientId, selectedFiles);
      setIsNotificationVisibleSubir(true)
      setPdfUrls(response.pdf_urls); // La API devuelve las URLs de los PDFs subidos
      await loadPatientsData();
    } catch (error) {
      setMessage("Error al subir los PDFs.", error);
    }

    setUploading(false);
  };

  return (
    <div className="container-proteccion-datos">
      <h2>Protección de Datos del Paciente</h2>

      {/* Inputs de archivo para los tres tipos de PDFs */}
      <div className="input-proteccion-datos">
        <label>Protección de Datos</label>
        <input type="file" name="pdf_firmado_general" accept="application/pdf" onChange={handleFileChange} />
        {patient.pdf_firmado_general && (
          <p>
            <a href={patient.pdf_firmado_general} target="_blank" rel="noopener noreferrer">
              <FaFilePdf /> Protección de datos
            </a>
          </p>
        )}
      </div>

      <div>
        <label>Consentimiento Menor</label>
        <input type="file" name="pdf_firmado_menor" accept="application/pdf" onChange={handleFileChange} />
        {patient.pdf_firmado_menor && (
            <p>
                <a href={patient.pdf_firmado_menor} target="_blank" rel="noopener noreferrer">
                  <FaFilePdf /> Consentimiento menor
                </a>
            </p>
        )}
      </div>

      <div>
        <label>Consentimiento Fisioterapia Invasiva</label>
        <input type="file" name="pdf_firmado_inyecciones" accept="application/pdf" onChange={handleFileChange} />
        {patient.pdf_firmado_inyecciones && (
            <p>
            <a href={patient.pdf_firmado_inyecciones} target="_blank" rel="noopener noreferrer">
              <FaFilePdf /> Consentimiento Fisioterapia Invasiva
            </a>
          </p>
        )}
      </div>
      <Boton onClick={handleUpload} disabled={uploading} texto={uploading ? "Subiendo..." : "Subir PDFs"} />

      <Notification message="Archivo subido correctamente." isVisible={isNotificationVisibleSubir} onClose={() => setIsNotificationVisibleSubir(false)} />
      {message && (<p>Hubo un error. {message}</p>)}

    </div>
  );
};

export default UploadPDF;
