import React, { useState, useEffect } from 'react';
import '../styles/Componentes/Notification.css'; // Importar el CSS de estilo

const Notification = ({ message, isVisible, onClose, type }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose(); // Ocultar la notificación después de 3 segundos
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    isVisible && (
      <div className={`notification-container ${type}`}>
        <div className="notification-message">
          {message}
        </div>
        <button className="notification-close" onClick={onClose}>X</button>
      </div>
    )
  );
};

export default Notification;
