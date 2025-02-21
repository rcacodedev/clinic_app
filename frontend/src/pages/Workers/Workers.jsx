import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Workers/workers.css';
import CustomModal from '../../components/Modal';
import Boton from '../../components/Boton';
import Notificacion from '../../components/Notification'
import { createWorker, fetchWorkers } from '../../services/workerService';
import { fetchGrupos } from '../../services/django';
import { HexColorPicker } from 'react-colorful'

const WorkersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirm_password: '',
    first_name: '', last_name: '', groups: [], color: color, userInfo:[],
  });
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const colorPickerRef = useRef(null);

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

    const loadGroups = async () => {
      try {
        const gruposList = await fetchGrupos();
        setGroups(gruposList);
      } catch (error) {
        console.error('Error al cargar los grupos:', error)
      }
    };

    loadWorkers();
    loadGroups();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleColorChange = (newColor) => {
    setColor(newColor);  // Actualiza el color en el estado
    setFormData((prevState) => ({
      ...prevState,
      color: newColor,  // Asegura que el color se guarde en formData
    }));
  };

  // Cerrar el selector si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setColorPickerVisible(false);
      }
    };

    if (colorPickerVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPickerVisible]);

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ username: '', email: '', password: '', confirm_password: '',
      first_name: '', last_name: '', groups: [], userInfo: [],
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
      groups: formData.groups ? [parseInt(formData.groups)] : [],
      color: formData.color,
      userInfo: [],
    };

    try {
      const newWorker = await createWorker(workerData);
      setWorkers([...workers, newWorker]);
      handleCloseModal();
      setIsNotificationVisible(true);
    } catch (error) {
      setError('Error al crear el trabajador');
      console.error(error);
    }
  };

  return (
    <div className="workers-container">
      <h1>Gestionar Empleados</h1>
      <Boton texto="Agregar Empleado" onClick={handleOpenModal} />

      <CustomModal isOpen={isModalOpen} onRequestClose={handleCloseModal} title="Agregar Empleado">
        <form onSubmit={handleCreateWorker} className="form">
          {['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name']
            .map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}:</label>
                <input type={field.includes('password') ? 'password' : 'text'} id={field} name={field} value={formData[field]} onChange={handleInputChange} required />
              </div>
            ))}

          <div className="form-group">
            <label htmlFor="grupos">Departamento:</label>
            <select
              id="grupos"
              name="groups"
              value={formData.groups}
              onChange={(e) => setFormData({ ...formData, groups: [parseInt(e.target.value)] })}
              required
            >
              <option value="">Selecciona un departamento:</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor="color">Selecciona Color:</label>
            {/* Mostrar un recuadro con el color actual */}
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: color,
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
              onClick={() => setColorPickerVisible(!colorPickerVisible)}  // Cambiar la visibilidad del selector
            ></div>

            {/* Mostrar el SketchPicker solo cuando el usuario haga clic */}
            {colorPickerVisible && (
              <div ref={colorPickerRef} style={{ position: "absolute", zIndex: 2, background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0px 2px 10px rgba(0,0,0,0.2)" }}>
                <HexColorPicker color={color} onChange={handleColorChange} />
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-buttons">
            <Boton texto="Cancelar" onClick={handleCloseModal} tipo="peligro" />
            <Boton texto="Crear" tipo="guardar" />
          </div>
        </form>
      </CustomModal>

      <div className="container-cards">
        <div className='main-card'>
          <div className='cards'>
            <div className='card'>
              <div className='content'>
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <div key={worker.id} className="worker-card" style={{ '--worker-color': worker.color }} onClick={() => navigate(`/api/workers/${worker.id}`)}>
                      <div className='photo-container'>
                        <img src={worker.user.userInfo.photo} alt='Foto perfil del empleado.' className='profile-photo'/>
                      </div>
                      <div className='details'>
                        <div className="name"><h3>{worker.user.first_name} {worker.user.last_name}</h3></div>
                        <div className="email"><strong>Email:</strong><span>{worker.user.email}</span></div>
                        <div className="phone"><strong>Teléfono:</strong><span>{worker.user.userInfo.phone}</span></div>
                        <div className="departamento"><strong>Departamento:</strong><span>{worker.groups.length > 0 && groups.find(group => group.id === worker.groups[0])?.name || 'Sin Departamento'}</span></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay empleados disponibles.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Notificacion
        message="Empleado añadido correctamente"
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
        />
    </div>
  );
};

export default WorkersPage;
