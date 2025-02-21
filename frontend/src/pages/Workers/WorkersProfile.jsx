import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorkerDetails, deleteWorker, fetchWorkerAppointments } from '../../services/workerService';
import { fetchGrupos } from '../../services/django';
import EditarEmpleadoModal from '../../components/Workers/EditarEmpleadoModal';
import EliminarEmpleadoModal from '../../components/Workers/EliminarEmpleadoModal';
import CrearCita from '../../components/Workers/CrearCitaWorker';
import Agenda from '../../components/Agenda';
import EditarCitaModal from '../../components/Workers/EditarCitaWorker';
import WorkerPDFUpload from '../../components/Workers/RegistroJornada';
import '../../styles/Workers/workerProfile.css'

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState([]);
  const [isEditCitaModalOpen, setIsEditCitaModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null); // Aquí inicializamos selectedCita
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadWorker(), loadAppointments()]);
        initializeWeek();
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del trabajador');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const loadWorker = async () => {
    const data = await fetchWorkerDetails(id);
    setWorker(data);

    // Obtener todos los grupos disponibles
    const allGroups = await fetchGrupos(); // Esto debería devolver todos los grupos

    // Filtrar los nombres de los grupos a los que pertenece el trabajador
    const groupNames = data.groups.map((groupId) => {
      const group = allGroups.find((g) => g.id === groupId);
      return group ? group.name : "Grupo desconocido";
    });

    setGroups(groupNames);
  };

  const loadAppointments = async () => {
    const data = await fetchWorkerAppointments(id);
    setAppointments(data);
  };

  const initializeWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const week = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    setCurrentWeek(week);
  };

  const changeWeek = (direction) => {
    setCurrentWeek((prevWeek) =>
      prevWeek.map((day) => new Date(day.getTime() + direction * 7 * 24 * 60 * 60 * 1000))
    );
  };

  const handleDeleteWorker = async () => {
    try {
      await deleteWorker(id);
      alert('Empleado eliminado correctamente');
      navigate('/api/workers');
    } catch (error) {
      console.error('Error al eliminar el empleado:', error);
      alert('No se pudo eliminar al empleado. Inténtelo de nuevo.');
    }
  };

  const openModal = (cita) => {
    setSelectedCita(cita); // Aquí actualizamos el estado de selectedCita
    setIsEditCitaModalOpen(true); // Abrimos el modal
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!worker) return <p>No se encontraron datos del empleado.</p>;

  return (
    <div className="worker-profile-container">
      <div className="worker-header">
        <h1>Perfil de {worker.user.first_name} {worker.user.last_name}</h1>
        <div className='photo-container'>
          <img src={worker.user.userInfo.photo} alt="Foto del empleado" className='profile-photo'/>
        </div>
      </div>
      <h2>Datos del Empleado</h2>
      <div className="worker-info">
        <div className="worker-field"><strong>Username:</strong> <span>{worker.user.username}</span></div>
        <div className="worker-field"><strong>Email:</strong> <span>{worker.user.email}</span></div>
        <div className="worker-field"><strong>Teléfono:</strong> <span>{worker.user.userInfo.phone}</span></div>
        <div className="worker-field"><strong>DNI:</strong> <span>{worker.user.userInfo.dni}</span></div>
        <div className="worker-field"><strong>Dirección:</strong> <span>{worker.user.userInfo.address}</span></div>
        <div className="worker-field"><strong>Código Postal:</strong> <span>{worker.user.userInfo.postal_code}</span></div>
        <div className="worker-field"><strong>País:</strong> <span>{worker.user.userInfo.country}</span></div>
        <div className="worker-field">
          <strong>Departamento:</strong>
          <span>
            {groups.length > 0 ? groups.join(", ") : "No asignado"}
          </span>
        </div>
        <div className="worker-field"><strong>Estado:</strong> <span>{worker.is_active ? 'Activo' : 'Inactivo'}</span></div>
        <div className="worker-field">
          <strong>Color del Empleado:</strong>
          <div
            style={{
              width: '50px',
              height: '20px',
              backgroundColor: worker.color,
              marginTop: '5px',
              borderRadius: '5px'
            }}
          />
        </div>
      </div>
      <div className="worker-actions">
        <button className="btn-primary" onClick={() => setIsEditModalOpen(true)}>Editar</button>
        <button className="btn-danger" onClick={() => setIsDeleteConfirmOpen(true)}>Eliminar</button>
      </div>

      <EditarEmpleadoModal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        worker={worker}
        onWorkerUpdated={setWorker}
      />

      <EliminarEmpleadoModal
        isOpen={isDeleteConfirmOpen}
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
        worker={worker}
        onConfirmDelete={handleDeleteWorker}
      />
      <h2>Agenda de {worker.user.first_name} {worker.user.last_name}</h2>
      <div className="worker-agenda">
        <CrearCita refreshCitas={loadAppointments} workerId={id} />
        <Agenda
          citas={appointments}
          currentWeek={currentWeek}
          changeWeek={changeWeek}
          openModal={openModal} // Pasamos openModal a Agenda
          selectedCita={selectedCita}
          setSelectedCita={setSelectedCita} // Pasamos setSelectedCita a Agenda
        />
      </div>

      <EditarCitaModal
        showModal={isEditCitaModalOpen}
        onClose={() => setIsEditCitaModalOpen(false)}
        cita={selectedCita} // Pasamos selectedCita
        refreshCitas={loadAppointments}
        workerId={id}
      />
      <div className='Documentacion'>
        <WorkerPDFUpload workerId={id} />
      </div>

    </div>
  );
};

export default WorkerProfile;
