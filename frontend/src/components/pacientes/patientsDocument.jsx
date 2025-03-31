import { useState, useEffect } from "react";
import { fetchDocuments, uploadDocuments, deleteDocument } from "../../services/patientService";
import { FaFilePdf, FaTrash } from "react-icons/fa";
import Boton from "../Boton";
import Notification from "../Notification";
import "../../styles/pacientes/documents.css";

const PatientDocuments = ({ patientId }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  // Cargar los documentos del paciente
  const loadDocuments = async () => {
    const docs = await fetchDocuments(patientId);
    setDocuments(docs);
  };

  useEffect(() => {
    if (patientId) {
      loadDocuments();
    }
  }, [patientId]);

  // Manejar la selección de archivos
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Subir un documento
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona un archivo.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      await uploadDocuments(patientId, selectedFile);
      setIsNotificationVisible(true);
      setSelectedFile(null);
      loadDocuments(); // Recargar la lista de documentos
    } catch (error) {
      setMessage("Error al subir el archivo.");
    }

    setUploading(false);
  };

  // Eliminar un documento
  const handleDelete = async (documentId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este documento?");
    if (!confirmDelete) return;

    try {
      await deleteDocument(documentId);
      loadDocuments(); // Recargar la lista de documentos
    } catch (error) {
      setMessage("Error al eliminar el documento.");
    }
  };

  return (
    <div className="container-documents">
      <h2>Documentos del Paciente</h2>

      {/* Input de carga de archivo */}
      <div className="input-documents">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <Boton onClick={handleUpload} disabled={uploading} texto={uploading ? "Subiendo..." : "Subir Documento"} />
      </div>

      {/* Lista de documentos */}
      <ul className="documents-list">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <li key={doc.id} className="document-item">
              <a href={doc.file} target="_blank" rel="noopener noreferrer">
                <FaFilePdf /> {doc.file.split("/").pop()}
              </a>
              <button className="delete-btn" onClick={() => handleDelete(doc.id)}>
                <FaTrash /> Eliminar
              </button>
            </li>
          ))
        ) : (
          <p>No hay documentos subidos.</p>
        )}
      </ul>

      {/* Notificaciones */}
      <Notification message="Archivo subido correctamente." isVisible={isNotificationVisible} onClose={() => setIsNotificationVisible(false)} />
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default PatientDocuments;
