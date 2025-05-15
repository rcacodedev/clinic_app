import React, { useEffect } from "react";
import Modal from "react-modal";
import Boton from "./Boton"; // Importamos el componente Boton
import "../styles/Componentes/Modal.css";

Modal.setAppElement("#root");

const CustomModal = ({
  isOpen,
  onRequestClose,
  title,
  children,
  closeButtonText = "Cerrar",
  modalStyle = {},
  actions = [],
}) => {
  useEffect(() => {
    if (isOpen) {
      const modalContent = document.querySelector(".ReactModalPortal");
      modalContent?.setAttribute("tabindex", "0"); // Hacer el contenedor tabulable
      modalContent?.focus(); // Focalizar al abrir
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="custom-modal-content"
      overlayClassName={`custom-modal-overlay ${isOpen ? "open" : ""}`}
      shouldFocusAfterRender={true}
      shouldCloseOnEsc={true}
      style={modalStyle}
      shouldReturnFocusAfterClose={true}
    >
      {title && <h2 className="title-section">{title}</h2>}
      <div className="modal-body">{children}</div>
      <div className="modal-buttons">
        {actions.map((action, index) => (
          <Boton
            key={index}
            texto={action.text}
            tipo={action.className || "primario"} // Usamos el tipo para definir estilos dinámicos
            onClick={action.onClick}
            disabled={action.disabled}
          />
        ))}
        <Boton
          texto={closeButtonText}
          tipo="primario" // Tipo "secundario" para diferenciar el botón de cerrar
          onClick={onRequestClose}
        />
      </div>
    </Modal>
  );
};

export default CustomModal;
