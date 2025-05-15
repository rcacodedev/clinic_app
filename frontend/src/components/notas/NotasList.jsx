import React, {useEffect, useState} from "react";
import { fetchNotes, createNote, deleteNote, updateNote } from "../../services/notesService";
import Boton from '../Boton'
import CrearNotaModal from "./crearNotaModal";
import EditarNotaModal from "./editarNotaModal";
import Notification from "../Notification";
import '../../styles/notas/notasList.css'

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
    const [filters, setFilters] = useState({
        is_important: true,  // true, false o undefined
        reminder_date: '',        // formato 'YYYY-MM-DD'
    });

    // Función para cargar las notas
    const loadNotes = async (page, order = '-is_important,-reminder_date,-created_at') => {
        try {
            const data = await fetchNotes(page, order, filters);
            setNotas(data.results);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error('Error al obtener las notas', error);
        }
    };
    // Carga las notas
    useEffect (() => {
        loadNotes(currentPage)
    }, [currentPage, filters])

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
            setNotas((prevNotas) => [...prevNotas, savedNote]);  // Agregar la nueva nota al estado
            setIsModalOpenCreate(false)
            setNotificationVisibleCrear(true);
        } catch (error) {
            console.error("Error al crear nota", error);
            setNotificationVisibleCrear(false);
            // Mostrar error
            alert("Hubo un problema al crear la nota. Intenta nuevamente.");
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
        if (note) {
            setSelectedNote(note);
            setIsModalOpenEdit(true);
        }
    };


    // Actualizar notas
    const handleUpdateNota = async (updatedNote) => {
        try {
            const savedNota = await updateNote(updatedNote.id, updatedNote);
            setNotas((prevNotas) => prevNotas.map((note) => (note.id === savedNota.id ? savedNota : note)));
            setNotificationVisibleUpdate(true);
        } catch (error) {
            console.error("Error al actualizar la nota", error)
        }
    }

    const aplicarFiltros = (nuevosFiltros) => {
        setCurrentPage(1); // Resetea la paginación a la primera página
        setFilters(nuevosFiltros);
    };

    return (
        <div className="container-notas">
            <h2 className="title-section">Mis notas</h2>
            <div className="botones-notas">
                <Boton texto="Añadir nota" onClick={() => setIsModalOpenCreate(true)} />
                <div className="filtros-notas">
                    <Boton texto="Todas" onClick={() => aplicarFiltros({ is_important: undefined, reminder_date: '' })} tipo="primario" />
                    <Boton texto="Importantes" onClick={() => aplicarFiltros({ is_important: true, reminder_date: '' })} tipo="primario" />
                    <Boton texto="Con recordatorio hoy" onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        aplicarFiltros({ is_important: undefined, reminder_date: today });
                    }} tipo="primario" />
                </div>
            </div>
            <div className="list-notas-container">
              {notas.map((note) => (
                <div
                    key={note.id}
                    className="note-item"
                    style={{ backgroundColor: note.color }} // Usando el color directamente
                >
                  <h3 className="note-title">{note.titulo}</h3>
                  <p className="note-contenido">{note.contenido}</p>
                  <div className="botones-notas-inside">
                    <Boton texto="Editar" onClick={() => handleOpenEditModal(note)} aria-label="Editar nota" />
                    <Boton texto="Eliminar" onClick={() => handleDeleteNota(note.id)} tipo="peligro" aria-label="Eliminar nota" />
                  </div>
                </div>
              ))}
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