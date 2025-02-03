import React from 'react';
import CustomModal from '../Modal';  // Importamos el modal personalizado
import Boton from '../Boton';

const EliminarEmpleadoModal = ({ isOpen, onRequestClose, worker, onConfirmDelete }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`¿Estás seguro de eliminar al empleado ${worker.user.first_name} ${worker.user.last_name}?`}
    >
      <div>
        <Boton texto="Sí, eliminar" tipo="eliminar" onClick={onConfirmDelete} />
        <Boton texto="Cancelar" tipo="primario" onClick={onRequestClose} />
      </div>
    </CustomModal>
  );
};

export default EliminarEmpleadoModal;
