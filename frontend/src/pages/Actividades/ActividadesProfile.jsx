import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivity, updateActivity, deleteActivity } from '../../services/activityService';
import patientService from '../../services/patientService';
import { getToken, decodeJWT } from "../../utils/auth";
import { fetchWorkers } from "../../services/workerService";
import '../../styles/actividades/actividadesProfile.css';

const ActividadesProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monitor_id: '',
    start_time: '',
    end_time: '',
    recurrence_days: [],
    precio: 0,
  });

  const [pacientes, setPacientes] = useState([]);
  const [pacientesAsignados, setPacientesAsignados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePatientsCount, setVisiblePatientsCount] = useState(5);
  const [editMode, setEditMode] = useState(false);

  const fetchActividad = async () => {
    try {
      const response = await getActivity(id);
      if (response) {
        setActividad(response);
        const pacientesDetails = await Promise.all(
          (response.patients || []).map(id => patientService.getPatientById(id))
        );
        setPacientesAsignados(pacientesDetails);
      }
    } catch (error) {
      console.error('Error al cargar la actividad:', error);
    }
  };
  // Cargar actividad y pacientes asignados
  useEffect(() => {
    fetchActividad();
  }, [id]);

  // Sincronizar formData con la actividad cargada
  useEffect(() => {
    if (actividad && actividad.name) {
      setFormData({
        name: actividad.name || '',
        description: actividad.description || '',
        monitor_id: actividad.monitor?.id || '',
        start_time: actividad.start_time || '',
        end_time: actividad.end_time || '',
        recurrence_days: actividad.recurrence_days || [],
        precio: actividad.precio || 0,
      });
    }
  }, [actividad]);

  // Cargar pacientes disponibles
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await patientService.getPatients({
          searchTerm,
          includePagination: false,
        });
        setPacientes(data.results || []);
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
      }
    };

    fetchPacientes();
  }, [searchTerm]);

  // Scroll infinito para pacientes disponibles
  const handleScroll = useCallback(() => {
    const container = document.querySelector('.left-column');
    if (container) {
      const bottom = container.scrollHeight - container.scrollTop === container.clientHeight;
      if (bottom && pacientes.length > visiblePatientsCount) {
        setVisiblePatientsCount(count => count + 5);
      }
    }
  }, [pacientes.length, visiblePatientsCount]);

  useEffect(() => {
    const container = document.querySelector('.left-column');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monitor' ? parseInt(value) : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await updateActivity(actividad.id, formData);
      navigate(`/api/actividades/${actividad.id}`);
      fetchActividad()
      setEditMode(false);
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta actividad?')) {
      try {
        await deleteActivity(actividad.id);
        navigate('/api/actividades');
      } catch (error) {
        console.error('Error al eliminar actividad:', error);
      }
    }
  };

  const addPaciente = async (paciente) => {
    const nuevosAsignados = [...pacientesAsignados, paciente];
    const updatedActividad = {
      ...actividad,
      patients: nuevosAsignados.map(p => p.id),
    };

    try {
      await updateActivity(id, updatedActividad);
      setPacientesAsignados(nuevosAsignados);
      setPacientes(pacientes.filter(p => p.id !== paciente.id));
      setActividad(updatedActividad);
    } catch (error) {
      console.error('Error al asignar paciente:', error);
    }
  };

  const removePaciente = async (paciente) => {
    const nuevosAsignados = pacientesAsignados.filter(p => p.id !== paciente.id);
    const updatedActividad = {
      ...actividad,
      patients: nuevosAsignados.map(p => p.id),
    };

    try {
      await updateActivity(id, updatedActividad);
      setPacientesAsignados(nuevosAsignados);
      setPacientes([...pacientes, paciente]);
      setActividad(updatedActividad);
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
    }
  };

  const filteredPacientes = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [workersOptions, setWorkersOptions] = useState([]);

  useEffect(() => {
      const fetchWorkersOptions = async () => {
        try {
            // Llamamos a la función para obtener el token
            const token = getToken();
            if (!token) {
                console.error("Token no encontrado");
                return;
            }
            // Decodificamos el token para obtener los datos del usuario
            const decodedUser = decodeJWT(token);
            if (!decodedUser) {
                console.error("No se pudo decodificar el token");
                return;
            }
            // Extraemos el nombre y apellido del usuario desde el token decodificado
                    // Aquí es donde verificas si los datos del nombre están disponibles
            const currentUser = {
                id: decodedUser.user_id,
                name: decodedUser.first_name && decodedUser.last_name ? `${decodedUser.first_name} ${decodedUser.last_name}` : "Usuario Desconocido",
            };
            // Ahora hacemos la llamada a la API para obtener los trabajadores
            const response = await fetchWorkers();  // Suponiendo que fetchWorkers es la función para obtener la lista de trabajadores
            // Si la respuesta no tiene resultados, terminamos
            if (!response.results || response.results.length === 0) {
                console.error('No se encontraron trabajadores');
                return;
            }
            // Formateamos la lista de trabajadores
            const formattedWorkers = response.results.map(worker => ({
                id: worker.user.id,
                name: `${worker.user.first_name} ${worker.user.last_name}`,
            }));
            // Agregamos el usuario actual (el que creó la actividad) a la lista de monitores
            const allMonitors = [currentUser, ...formattedWorkers];
            // Actualizamos el estado con los monitores formateados
            setWorkersOptions(allMonitors);  // Asegúrate de tener el estado correctamente configurado
        } catch (error) {
            console.error('Error al cargar monitores:', error);
        }
    };

    fetchWorkersOptions();

  }, []);

  return (
    <div className="actividad-profile">
      <h2 className='title-section'>Detalles de la Actividad</h2>

      <div className="actividad-info">
        {editMode ? (
          <>
            <div className='form-group'>
              <label className='title-actividad'>Nombre de la Actividad</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" />
            </div>
            <div className='form-group'>
              <label className='description-actividad'>Descripción de la Actividad</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" />
            </div>
            <div className='form-group'>
              <label className='monitor-actividad'>
                  Monitor:
                  <select
                      name="monitor_id"
                      value={formData.monitor_id}
                      onChange={handleChange}
                      required
                  >
                      <option value="">Seleccionar monitor</option>
                      {workersOptions.map(worker => (
                          <option key={worker.id} value={worker.id}>
                              {worker.name}
                          </option>
                      ))}
                  </select>
              </label>
            </div>
            <div className='form-group'>
              <label className='hora-comienzo-actividad'>Hora de comienzo de la Actividad</label>
              <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label className='hora-finalizar-actividad'>Hora de finalización de la Actividad</label>
              <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label className='dias-actividad'>Días de la Semana</label>
              <div className="dias-semana-toggle">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    className={formData.recurrence_days.includes(dia) ? 'selected' : ''}
                    onClick={() => {
                      setFormData((prev) => {
                        const isSelected = prev.recurrence_days.includes(dia);
                        return {
                          ...prev,
                          recurrence_days: isSelected
                            ? prev.recurrence_days.filter(d => d !== dia)
                            : [...prev.recurrence_days, dia]
                        };
                      });
                    }}
                  >
                    {dia.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className='form-group'>
              <div>
                <label className='precio-actividad'>Precio:</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='form-actions'>
              <button onClick={handleUpdate}>Guardar</button>
              <button onClick={() => setEditMode(false)}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <h3 className='title-actividad'>{actividad.name}</h3>
            <p className='descripcion-actividad'><strong>Descripción:</strong> {actividad.description}</p>
            <p className='monitor-actividad'><strong>Monitor:</strong> {actividad.monitor?.first_name} {actividad.monitor?.last_name}</p>
            <p className='hora-comienzo-actividad'><strong>Hora Inicio:</strong> {actividad.start_time}</p>
            <p className='hora-finalizar-actividad'><strong>Hora Fin:</strong> {actividad.end_time}</p>
            {actividad.recurrence_days && actividad.recurrence_days.length > 0 && (
              <p className='dias-actividad'><strong>Días de la actividad:</strong> {actividad.recurrence_days.join(', ')}</p>
            )}
            <p className='precio-actividad'><strong>Precio:</strong> {actividad.precio} €</p>
            <div className='form-actions'>
              <button onClick={() => setEditMode(true)}>Editar</button>
              <button onClick={handleDelete}>Eliminar</button>
            </div>

          </>
        )}
      </div>

      <div className="pacientes-section">
        <h3 className='title-section'>Asignar Pacientes</h3>
        <input
          type="text"
          placeholder="Buscar Paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="columns">
          <div className="left-column">
            <h4>Pacientes Disponibles</h4>
            <ul>
              {filteredPacientes.slice(0, visiblePatientsCount).map(p => (
                <li key={p.id}>
                  {p.nombre} {p.primer_apellido} {p.segundo_apellido}
                  <button onClick={() => addPaciente(p)}>+</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="right-column">
            <h4>Pacientes Asignados</h4>
            <ul>
              {pacientesAsignados.map(p => (
                <li key={p.id}>
                  {p.nombre} {p.primer_apellido} {p.segundo_apellido}
                  <button onClick={() => removePaciente(p)}>-</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActividadesProfile;
