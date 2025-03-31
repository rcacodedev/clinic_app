import React, {useEffect, useState} from "react";
import { fetchNotes, createNote, deleteNote, updateNote } from "../../services/notesService";
import Boton from '../Boton'
import CrearNotaModal from "./crearNotaModal";
import EditarNotaModal from "./editarNotaModal";
import Notification from "../Notification";

const NotasList = () => {
    const [notas, setNotas] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [notificationVisibleCrear, setNotificationVisibleCrear] = useState(false)
    const [notificationVisibleDelete, setNotificationVisibleDelete] = useState(false)
    const [notificationVisibleUpdate, setNotificationVisibleUpdate] = useState(false)

    // Función para cargar las notas
    const loadNotes = async (page) => {
        try {
            const data = await fetchNotes(page);
            setNotas(data.results);
            setTotalPages(data.total_pages)
        } catch (error) {
            console.error('Error al obtener las notas', error)
        }
    };

    // Carga las notas
    useEffect (() => {
        loadNotes(currentPage)
    }, [currentPage])

    // Manejo de paginación
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Guardar nota
    const handleSaveNote = async (newNote) => {
        try {
            const savedNote = await createNote(newNote);
            setNotas((prevNotas) => [savedNote, ...prevNotas])
            setIsModalOpenCreate(false)
            setNotificationVisibleCrear(true)
        } catch (error) {
            console.error("Error al crear nota", error)
        }
    };

    // Eliminar nota
    const handleDeleteNota = async (id) => {
        try {
            await deleteNote(id);
            setNotas((prevNotas) => prevNotas.filter((note) => note.id !== id));
            setNotificationVisibleDelete(true);
        } catch (error) {
            console.error("Error al eliminar la nota", error)
        }
    }

    // Abrir el modal con la nota seleccionada
    const handleOpenEditModal = (note) => {
        setSelectedNote(note);
        setIsModalOpenEdit(true);
    };

    // Actualizar notas
    const handleUpdateNota = async (updatedNote) => {
        try {
            const savedNota = await updateNote(updatedNote.id, updatedNote);
            setNotas((prevNotas) => prevNotas.map((note) => (note.id === savedNota.id ? savedNota : note)),
            setNotificationVisibleUpdate(true)
        );
        } catch (error) {
            console.error("Error al actualizar la nota", error)
        }
    }

    return (
        <div className="container-notas">
            <h2>Mis notas</h2>
            <Boton texto="Añadir nota" onClick={() => setIsModalOpenCreate(true)} />
            <div className="list-notas-container">
                <ul className="notes-list">
                    {notas.map((note) => (
                        <li key={note.id} className="note-item">
                            <h3>{note.titulo}</h3>
                            <p>{note.contenido}</p>
                            <Boton texto="Editar" onClick={() => handleOpenEditModal(note)} />
                            <Boton texto="Eliminar" onClick={() => handleDeleteNota(note.id)} tipo="peligro"/>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="pagination">
                <Boton texto="Anterior" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                <span>{currentPage}</span>
                <Boton texto="Siguiente" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            </div>

            {/* Modal de crear nota */}
            <CrearNotaModal
                isOpen={isModalOpenCreate}
                onClose={() => setIsModalOpenCreate(false)}
                onSave={handleSaveNote}
                />
            {/* Modal de eliminar nota */}
            <EditarNotaModal
                isOpen={isModalOpenEdit}
                onClose={() => setIsModalOpenEdit(false)}
                onSave={handleUpdateNota}
                note={selectedNote}
                />
            <Notification message="Nota Creada correctamente" isVisible={notificationVisibleCrear} onClose={() => setNotificationVisibleCrear(false)} type="success"/>
            <Notification message="Nota Eliminada correctamente" isVisible={notificationVisibleDelete} onClose={() => setNotificationVisibleDelete(false)} type="error" />
            <Notification message="Nota Editada correctamente" isVisible={notificationVisibleUpdate} onClose={() => setNotificationVisibleUpdate(false)} type="success" />
        </div>
    );
}

export default NotasList;