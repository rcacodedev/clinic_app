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
        <>
            <div className="max-w-5xl mx-auto px-4 py-8">
              {/* Título */}
              <h2 className="text-3xl font-bold text-black mb-8 border-b-4 border-tan text-left">
                Mis Notas
              </h2>

              {/* Botones superiores */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Añadir nota */}
                <button
                  className="bg-negro hover:bg-tan text-white font-semibold px-4 py-2 rounded shadow"
                  onClick={() => setIsModalOpenCreate(true)}
                >
                  Añadir Nota
                </button>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className="bg-vanilla hover:bg-tan hover:text-white text-black font-medium px-3 py-2 rounded"
                    onClick={() => aplicarFiltros({ is_important: undefined, reminder_date: '' })}
                  >
                    Todas
                  </button>
                  <button
                    className="bg-vanilla hover:bg-tan hover:text-white text-black font-medium px-3 py-2 rounded"
                    onClick={() => aplicarFiltros({ is_important: true, reminder_date: '' })}
                  >
                    Importantes
                  </button>
                  <button
                    className="bg-vanilla hover:bg-tan hover:text-white text-black font-medium px-3 py-2 rounded"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      aplicarFiltros({ is_important: undefined, reminder_date: today });
                    }}
                  >
                    Con recordatorio hoy
                  </button>
                </div>
              </div>

              {/* Lista de notas */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {notas.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg shadow-md p-4 text-black"
                    style={{ backgroundColor: note.color }}
                  >
                    <h3 className="text-xl text-black font-semibold mb-2">{note.titulo}</h3>
                    <p className="text-base mb-4">{note.contenido}</p>
                    <p className="text-base font-semibold">{note.reminder_date}</p>

                    <div className="flex justify-end gap-2">
                      <button
                        className="bg-negro hover:bg-tan text-white font-semibold px-3 py-1 rounded"
                        onClick={() => handleOpenEditModal(note)}
                        aria-label="Editar nota"
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white font-semibold px-3 py-1 rounded"
                        onClick={() => handleDeleteNota(note.id)}
                        aria-label="Eliminar nota"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  className="bg-negro hover:bg-tan text-white font-medium px-4 py-2 rounded disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <span className="text-lg font-medium">{currentPage}</span>
                <button
                  className="bg-negro hover:bg-tan text-white font-medium px-4 py-2 rounded disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>



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
        </>

    );
}

export default NotasList;