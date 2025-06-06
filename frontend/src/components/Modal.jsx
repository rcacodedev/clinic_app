import React, { useEffect } from "react";
import Modal from "react-modal";
import Boton from "./Boton";

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
      modalContent?.setAttribute("tabindex", "0");
      modalContent?.focus();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldFocusAfterRender={true}
      shouldCloseOnEsc={true}
      shouldReturnFocusAfterClose={true}
      overlayClassName={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      className={`bg-white rounded-xl shadow-xl max-w-md w-full p-8 outline-none relative
        transform transition-transform duration-300
        ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      style={modalStyle}
    >
      {title && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">{title}</h2>
      )}
      <div className="mb-6 text-gray-700">{children}</div>
      <div className="flex justify-end gap-3">
        {actions.map((action, i) => (
          <Boton
            key={i}
            texto={action.text}
            tipo={action.className || "primario"}
            onClick={action.onClick}
            disabled={action.disabled}
          />
        ))}
        <Boton
          texto={closeButtonText}
          tipo="secundario"
          onClick={onRequestClose}
        />
      </div>
    </Modal>
  );
};

export default CustomModal;
