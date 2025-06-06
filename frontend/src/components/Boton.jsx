import React from 'react';


const Boton = ({ texto, onClick, tipo = "default", disabled = false, ...props }) => {
  // Definimos las clases dinámicamente según el tipo y si está deshabilitado
  const clases = `boton boton-${tipo} ${disabled ? "boton-disabled" : ""}`;

  return (
    <button
      className={clases}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props} // Pasar atributos adicionales como id, name, etc.
    >
      {texto}
    </button>
  );
};

export default Boton;
