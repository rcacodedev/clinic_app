import { useState, useEffect } from "react";
import {
  fetchDocumentos,
  uploadDocumentos,
  deleteDocumento,
} from "../../services/patientService";
import { FaFilePdf, FaTrash } from "react-icons/fa";
import ConfirmModal from "../ConfirmModal";
import { toast } from "react-toastify";

const PatientDocuments = ({ patientId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadDocuments = async () => {
    const docs = await fetchDocumentos(patientId);
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
      await uploadDocumentos(patientId, file);
      toast.success("El archivo se ha subido con éxito");
      loadDocuments(); // Recargar la lista
    } catch (error) {
      console.error("Error al subir el archivo", error);
      toast.error("Error al subir el archivo");
    }

    setUploading(false);
  };

  const handleDelete = async (documentId) => {
    try {
      await deleteDocumento(documentId);
      toast.success("El archivo se eliminó correctamente");
      loadDocuments();
    } catch (error) {
      console.error("Error al eliminar el archivo", error);
      toast.error("Error al eliminar el archivo");
    }
  };

  return (
    <div className="mt-4">
      <h2 className="title-section mb-4">Documentos Clínicos del Paciente</h2>

      <div className="relative flex h-10 w-full min-w-[200px] max-w-md">
        <input
          className="btn-datos-input"
          id="file_input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      <ul className="lista-patologias-ul">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <li key={doc.id} className="patologia-elemento-li">
              <a href={doc.archivo} target="_blank" rel="noopener noreferrer">
                <FaFilePdf /> {doc.archivo.split("/").pop()}
              </a>
              <button
                className="btn-eliminar"
                onClick={() => handleDelete(doc.id)}
              >
                <FaTrash />
              </button>
            </li>
          ))
        ) : (
          <p>No hay documentos subidos.</p>
        )}
      </ul>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        message="¿Estás seguro de que deseas eliminar este paciente?"
      />
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default PatientDocuments;
