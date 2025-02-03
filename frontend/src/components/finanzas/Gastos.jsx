import React, { useState, useEffect } from 'react';
import CustomModal from '../Modal';
import { crearGasto, getGastos } from '../../services/finanzasService'; // Servicio para agregar el gasto
import '../../styles/finanzas/gastos.css'

const Gastos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreGasto, setNombreGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [urlGasto, setUrlGasto] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [gastos, setGastos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [pageSize, setPageSize] = useState(10); // Número de elementos por página
  const [totalPages, setTotalPages] = useState(0); // Total de páginas

  const fetchGastos = async () => {
    try {
      const gastosData = await getGastos('total', currentPage, pageSize); // Llamada con los parámetros de paginación
      if (Array.isArray(gastosData)) {
        setGastos(gastosData); // Asigna directamente los datos si son un array
        setTotalPages(1); // Si no estás usando paginación, pon 1 o ajusta según la respuesta
      } else {
        setGastos([]); // En caso de datos incorrectos, asignamos un array vacío
      }
    } catch (error) {
      console.error('Error al cargar los gastos:', error);
      setGastos([]); // En caso de error, también asignamos un array vacío
    }
  };

  // Fetch de los gastos con paginación
 useEffect(() => {
    fetchGastos();
  }, [currentPage, pageSize]);


  // Maneja la apertura del modal
  const handleAddGasto = () => {
    if (!nombreGasto || !montoGasto || !urlGasto) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    const gasto = {
      descripcion: nombreGasto,
      monto: parseFloat(montoGasto),
      url: urlGasto,
    };

    crearGasto(gasto) // Llamada al servicio para agregar gasto
      .then(() => {
        setIsModalOpen(false); // Cerrar modal
        setNombreGasto('');
        setMontoGasto('');
        setUrlGasto('');
        setErrorMessage('');
        // Aquí podrías actualizar la lista de gastos si es necesario
        fetchGastos();
      })
      .catch((error) => {
        console.error('Error al agregar gasto:', error);
        setErrorMessage('Error al agregar el gasto');
      });
  };

    // Funciones para cambiar de página
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Añadir Gasto</button>

      <CustomModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        title="Añadir Gasto"
      >
        <div>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <div>
            <label htmlFor="nombreGasto">Descripción del gasto</label>
            <input
              type="text"
              id="nombreGasto"
              value={nombreGasto}
              onChange={(e) => setNombreGasto(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="montoGasto">Precio:</label>
            <input
              type="number"
              id="montoGasto"
              value={montoGasto}
              onChange={(e) => setMontoGasto(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="categoriaGasto">Url:</label>
            <input
              type="url"
              id="urlGasto"
              value={urlGasto}
              onChange={(e) => setUrlGasto(e.target.value)}
            />
          </div>
          <button onClick={handleAddGasto}>Agregar Gasto</button>
        </div>
      </CustomModal>

      <div>
        <h2>Lista de Gastos</h2>
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Precio</th>
              <th>URL</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{gasto.descripcion}</td>
                <td>{gasto.monto}</td>
                <td>{gasto.url}</td>
                <td>

                  {/* Aquí puedes agregar más acciones, como editar */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='paginacion'>
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Anterior
            </button>
            <span> Página {currentPage} de {totalPages} </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        </div>
    </div>

  );
};

export default Gastos;
