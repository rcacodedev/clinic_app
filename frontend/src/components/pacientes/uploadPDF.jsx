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

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (!file) return; // Si no se seleccionó un archivo, no hacer nada

    // Actualiza el estado con el archivo seleccionado
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [name]: file,
    }));

    // Crear el FormData para enviar el archivo al backend
    const formData = new FormData();
    formData.append(name, file); // Añadir el archivo al FormData

    setUploading(true);
    try {
      // Llamar a la función de uploadSignedPDFs con el patientId y el archivo
      const response = await patientService.uploadSignedPDFs(patientId, formData);

      // Actualizar URLs de los PDFs subidos
      setPdfUrls(response.pdf_urls);
      setIsNotificationVisibleSubir(true);
      setMessage('Archivo subido correctamente.');
      loadPatientsData();
    } catch (error) {
      setMessage('Error al subir el archivo.', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-proteccion-datos">
      <h2 className="title-section">Protección de Datos del Paciente</h2>

      {/* Inputs de archivo para los tres tipos de PDFs */}
      <div className="input-proteccion-datos">
        <label className="title-input">Protección de Datos</label>
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
        <label className="title-input">Consentimiento Menor</label>
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
        <label className="title-input">Consentimiento Fisioterapia Invasiva</label>
        <input type="file" name="pdf_firmado_inyecciones" accept="application/pdf" onChange={handleFileChange} />
        {patient.pdf_firmado_inyecciones && (
            <p>
            <a href={patient.pdf_firmado_inyecciones} target="_blank" rel="noopener noreferrer">
              <FaFilePdf /> Consentimiento Fisioterapia Invasiva
            </a>
          </p>
        )}
      </div>

      <Notification message="Archivo subido correctamente." isVisible={isNotificationVisibleSubir} onClose={() => setIsNotificationVisibleSubir(false)} type="success"/>
      {message && (<p>Hubo un error. {message}</p>)}

    </div>
  );
};

export default UploadPDF;
