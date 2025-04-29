import { useState, useEffect } from "react";
import { fetchDocuments, uploadDocuments, deleteDocument } from "../../services/patientService";
import { FaFilePdf, FaTrash } from "react-icons/fa";
import Notification from "../Notification";
import "../../styles/pacientes/documents.css";

const PatientDocuments = ({ patientId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const loadDocuments = async () => {
    const docs = await fetchDocuments(patientId);
    setDocuments(docs);
  };

  useEffect(() => {
    if (patientId) {
      loadDocuments();
    }
  }, [patientId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      await uploadDocuments(patientId, file);
      setIsNotificationVisible(true);
      loadDocuments(); // Recargar la lista
    } catch (error) {
      setMessage("Error al subir el archivo.");
    }

    setUploading(false);
  };

  const handleDelete = async (documentId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este documento?");
    if (!confirmDelete) return;

    try {
      await deleteDocument(documentId);
      loadDocuments();
    } catch (error) {
      setMessage("Error al eliminar el documento.");
    }
  };

  return (
    <div className="container-documents">
      <h2 className="title-section">Documentos Clínicos del Paciente</h2>

      <div className="input-documents">
        <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} />
      </div>

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

      <Notification
        message="Archivo subido correctamente."
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
      />
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default PatientDocuments;
