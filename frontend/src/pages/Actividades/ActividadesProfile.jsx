import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getActivity } from '../../services/activityService';
import { fetchWorkerDetails } from '../../services/workerService';
import { updateActivity } from '../../services/activityService';
import EditableField from '../../components/EditableField';
import { format } from 'date-fns';
import patientService from '../../services/patientService';  // Asegúrate de importar tu función
import '../../styles/actividades/actividadesProfile.css';

const ActividadesProfile = () => {
    const { id } = useParams();  // Obtener el id de la URL
    const [actividad, setActividad] = useState({});
    const [monitor, setMonitor] = useState(null);
    const [pacientes, setPacientes] = useState([]); // Pacientes disponibles
    const [pacientesAsignados, setPacientesAsignados] = useState([]); // Pacientes asignados
    const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Para filtrar pacientes
    const [visiblePatientsCount, setVisiblePatientsCount] = useState(5); // Controlar cuántos pacientes mostrar

    // Cargar los datos de la actividad solo una vez
    useEffect(() => {
        const fetchActividad = async () => {
            try {
                const response = await getActivity(id);
                if (response) {
                    setActividad(response);  // Solo actualizamos la actividad
                    setPacientesAsignados([]);  // Limpiamos los pacientes asignados antes de cargarlos

                    // Cargar detalles de los pacientes asignados usando los IDs
                    const pacientesDetails = await Promise.all(
                        response.patients.map(async (pacienteId) => {
                            const paciente = await patientService.getPatientById(pacienteId);
                            return paciente;  // Devuelve los detalles del paciente
                        })
                    );

                    setPacientesAsignados(pacientesDetails);  // Establecemos los pacientes asignados con los detalles completos
                } else {
                    console.error('No se encontraron datos de la actividad');
                }
            } catch (error) {
                console.error('Error al cargar la actividad:', error);
            }
        };

        fetchActividad();
    }, [id]);  // Este useEffect se ejecuta cuando el id cambia

    // Cargar el monitor solo una vez después de que se haya cargado la actividad
    useEffect(() => {
        if (actividad && actividad.monitor) {
            const monitorActividad = async () => {
                try {
                    const dataMonitor = await fetchWorkerDetails(actividad.monitor);
                    setMonitor(dataMonitor);
                } catch (error) {
                    console.error('No se encontró monitor', error);
                }
            };

            monitorActividad();
        }
    }, [actividad]);  // Solo se ejecuta cuando `actividad` cambia

    // Asegúrate de que pacientesDisponibles excluya los asignados
    useEffect(() => {
        const pacientesDisponibles = pacientes.filter(paciente =>
            !pacientesAsignados.some(assignedPaciente => assignedPaciente.id === paciente.id)
        );

        setPacientesDisponibles(pacientesDisponibles);
    }, [pacientes, pacientesAsignados]);  // Este useEffect se ejecuta cuando cambian pacientes o pacientesAsignados

    // Cargar todos los pacientes sin paginación
    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const data = await patientService.getPatients({
                    searchTerm,
                    includePagination: false,  // No usamos paginación
                });
                setPacientes(data.results || []);  // Asegúrate de que los pacientes estén en 'results'
            } catch (error) {
                console.error('Error al cargar pacientes:', error);
            }
        };

        fetchPacientes();
    }, [searchTerm]);  // Se ejecuta cada vez que cambian el searchTerm

    // Función que maneja el scroll infinito solo para la columna de pacientes disponibles
    const handleScroll = useCallback(() => {
        const pacientesContainer = document.querySelector('.left-column');
        if (pacientesContainer) {
            const bottom = pacientesContainer.scrollHeight === pacientesContainer.scrollTop + pacientesContainer.clientHeight;
            if (bottom && pacientes.length > visiblePatientsCount) {
                setVisiblePatientsCount(prevCount => prevCount + 5);
            }
        }
    }, [pacientes.length, visiblePatientsCount]);

    useEffect(() => {
        const pacientesContainer = document.querySelector('.left-column');
        if (pacientesContainer) {
            pacientesContainer.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (pacientesContainer) {
                pacientesContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);


    const handleFieldSave = async (field, value) => {
        try {
            let newValue = value;

            // Si el campo es una fecha, formatearlo antes de enviarlo
            if (field === 'start_date') {
                console.log('Valor de start_date antes de la conversión:', value);

                // Asegúrate de que no haya "undefined" en el valor
                if (value && value !== 'undefined' && value !== '') {
                    // Convertir la fecha en formato de cadena a un objeto Date
                    const parsedDate = new Date(value);

                    // Si la fecha es válida, formatearla
                    if (parsedDate instanceof Date && !isNaN(parsedDate)) {
                        newValue = format(parsedDate, 'yyyy-MM-dd');
                    } else {
                        console.error('Fecha no válida:', value);
                        return;  // No actualices si la fecha es inválida
                    }
                } else {
                    console.error('Valor de fecha inválido:', value);
                    return;
                }
            }

            const newDataActivity = { ...actividad, [field]: newValue };
            await updateActivity(id, newDataActivity);
            setActividad(newDataActivity);
        } catch (error) {
            console.error('Error al actualizar el campo:', error);
        }
    };

    // Filtrar pacientes según la búsqueda
    const filteredPacientes = pacientes.filter((paciente) =>
        paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agregar un paciente
    const addPaciente = (paciente) => {
        const updatedPacientesAsignados = [...pacientesAsignados, paciente];  // Almacenar el objeto completo
        const updatedActividad = { ...actividad, patients: updatedPacientesAsignados.map(p => p.id) };  // Usar solo los IDs para la actividad

        setPacientesAsignados(updatedPacientesAsignados);
        setPacientes(pacientes.filter(p => p.id !== paciente.id));  // Eliminar de la lista de pacientes disponibles
        setActividad(updatedActividad);

        // Actualizar la actividad solo con los IDs de los pacientes
        updateActivity(id, updatedActividad);
    };

    // Eliminar un paciente
    const removePaciente = (paciente) => {
        const updatedPacientesAsignados = pacientesAsignados.filter(p => p.id !== paciente.id);
        const updatedActividad = { ...actividad, patients: updatedPacientesAsignados.map(p => p.id) };

        setPacientes([...pacientes, paciente]);  // Volver a agregar el paciente a la lista de disponibles
        setPacientesAsignados(updatedPacientesAsignados);  // Actualizar la lista de pacientes asignados
        setActividad(updatedActividad);  // Actualizar la actividad con los pacientes asignados

        // Actualizar la actividad solo con los IDs de los pacientes
        updateActivity(id, updatedActividad);
    };

    return (
        <div className="actividad-profile">
            <h2>Detalles de la Actividad</h2>

            <div className="actividad-info">
                <EditableField
                    label="Nombre de la Actividad"
                    value={actividad.name}
                    onSave={(value) => handleFieldSave('name', value)}
                />
                <EditableField
                    label="Descripción de la Actividad"
                    value={actividad.description}
                    onSave={(value) => handleFieldSave('description', value)}
                />
                <EditableField
                    label="Monitor de la Actividad"
                    value={monitor ? `${monitor.user.first_name} ${monitor.user.last_name}` : 'No asignado'}
                    onSave={(value) => handleFieldSave('monitor', value)}
                />

                <EditableField
                    type='time'
                    label="Hora de Comienzo"
                    value={actividad.start_time}
                    onSave={(value) => handleFieldSave('start_time', value)}
                />
                <EditableField
                    type='time'
                    label="Hora de Finalización"
                    value={actividad.end_time}
                    onSave={(value) => handleFieldSave('end_time', value)}
                />
                <EditableField
                    type="checkbox"
                    label="Días a la semana"
                    value={actividad.recurrence_days || []}
                    options={[
                        { value: 'Lunes', label: 'Lunes' },
                        { value: 'Martes', label: 'Martes' },
                        { value: 'Miércoles', label: 'Miércoles' },
                        { value: 'Jueves', label: 'Jueves' },
                        { value: 'Viernes', label: 'Viernes' },
                    ]}
                    onSave={(value) => handleFieldSave('recurrence_days', value)}
                />

                {/* Nueva funcionalidad para asignar pacientes */}
                <div className="pacientes-section">
                    <h3>Asignar Pacientes</h3>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar Paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="columns">
                        <div className="left-column">
                            <h4>Pacientes Disponibles</h4>
                            <ul>
                                {filteredPacientes.slice(0, visiblePatientsCount).map((paciente) => (
                                    <li key={paciente.id}>
                                        {paciente.nombre} {paciente.primer_apellido} {paciente.segundo_apellido}
                                        <button onClick={() => addPaciente(paciente)}>+</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="right-column">
                            <h4>Pacientes Asignados</h4>
                            <ul>
                                {pacientesAsignados.map((paciente) => (
                                    <li key={paciente.id}>
                                        {paciente.nombre} {paciente.primer_apellido} {paciente.segundo_apellido}
                                        <button onClick={() => removePaciente(paciente)}>-</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActividadesProfile;
