import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Workers/workers.css';
import CustomModal from '../../components/Modal';
import Boton from '../../components/Boton';
import { createWorker, fetchWorkers } from '../../services/workerService';

const WorkersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirm_password: '',
    first_name: '', last_name: '', dni: '', address: '',
    postal_code: '', country: '', branch: '', phone: '',
  });
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const workersList = await fetchWorkers();
        setWorkers(workersList.results);
      } catch (error) {
        console.error('Error al cargar los trabajadores:', error);
      }
    };
    loadWorkers();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ username: '', email: '', password: '', confirm_password: '',
      first_name: '', last_name: '', dni: '', address: '',
      postal_code: '', country: '', branch: '', phone: '',
    });
    setError('');
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const workerData = {
      user: {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        confirm_password: formData.confirm_password,
      },
      branch: formData.branch,
      dni: formData.dni,
      address: formData.address,
      postal_code: formData.postal_code,
      country: formData.country,
      phone: formData.phone,
    };

    try {
      const newWorker = await createWorker(workerData);
      setWorkers([...workers, newWorker]);
      handleCloseModal();
    } catch (error) {
      setError('Error al crear el trabajador');
    }
  };

  return (
    <div className="workers-container">
      <h1>Gestionar Trabajadores</h1>
      <Boton texto="Agregar Trabajador" onClick={handleOpenModal} />

      <CustomModal isOpen={isModalOpen} onRequestClose={handleCloseModal} title="Agregar Trabajador">
        <form onSubmit={handleCreateWorker} className="form">
          {['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'dni', 'address', 'postal_code', 'country', 'phone']
            .map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}:</label>
                <input type={field.includes('password') ? 'password' : 'text'} id={field} name={field} value={formData[field]} onChange={handleInputChange} required />
              </div>
            ))}
          <div className="form-group">
            <label htmlFor="branch">Sección:</label>
            <select id="branch" name="branch" value={formData.branch} onChange={handleInputChange}>
              <option value="">Selecciona una sección</option>
              <option value="fisioterapia">Fisioterapia</option>
              <option value="psicologia">Psicología</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-buttons">
            <Boton texto="Cancelar" onClick={handleCloseModal} tipo="peligro" />
            <Boton texto="Crear" tipo="guardar" />
          </div>
        </form>
      </CustomModal>

      <div className="workers-list">
        {workers.length > 0 ? (
          workers.map((worker) => (
            <div key={worker.id} className="worker-card" onClick={() => navigate(`/workers/${worker.id}`)}>
              <h3>{worker.user.first_name} {worker.user.last_name}</h3>
              <p>{worker.user.email}</p>
              <p>{worker.phone}</p>
            </div>
          ))
        ) : (
          <p>No hay trabajadores disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default WorkersPage;
