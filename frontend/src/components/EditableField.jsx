import React, { useState, useEffect } from 'react';
import EditarIcon from '../assets/editar.svg';
import '../styles/editableField.css';

const EditableField = ({ value, onSave, label, type = 'text', options = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    // Función para formatear la fecha de "YYYY/MM/DD" a "YYYY-MM-DD"
    const formatDate = (date) => {
        const [year, month, day] = date.split('/');
        return `${year}-${month}-${day}`;  // Convierte "YYYY/MM/DD" a "YYYY-MM-DD"
    };

    // Función para formatear la hora a 'hh:mm'
    const formatTime = (time) => {
        return time.slice(0, 5);  // Convierte "14:30:00" a "14:30"
    };

    const handleSave = () => {
        setIsEditing(false);
        let formattedValue = inputValue;

        // Formatear la fecha o la hora si es necesario
        if (type === 'date') {
            // Asegurémonos de que la fecha esté en formato YYYY-MM-DD
            formattedValue = formatDate(inputValue);  // Formateamos la fecha
        } else if (type === 'time') {
            formattedValue = formatTime(inputValue);  // Formateamos la hora
        }

        // Solo actualizamos si el valor ha cambiado
        if (formattedValue !== value) {
            onSave(formattedValue); // Llama a la función para guardar el cambio
        }

        // Solo actualizamos si el valor ha cambiado
        if (JSON.stringify(inputValue) !== JSON.stringify(value)) {
            onSave(inputValue);  // Llama a la función para guardar el cambio
        }
    };

    const toggleSelection = (optionValue) => {
        if (inputValue.includes(optionValue)) {
            setInputValue(inputValue.filter((item) => item !== optionValue));
        } else {
            setInputValue([...inputValue, optionValue]);
        }
    };

    const renderInput = () => {
        switch (type) {
            case 'text':
            case 'date':
            case 'time':
                return (
                    <input
                        type={type}
                        value={inputValue}  // Usa el valor formateado
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleSave} // Guardar al perder el foco
                        autoFocus
                    />
                );
            case 'select':
                return (
                    <select
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleSave} // Guardar al perder el foco
                        autoFocus
                    >
                        <option value="">Seleccione una opción</option>
                        {options.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'checkbox':
                return (
                    <div className="checkbox-group" onBlur={handleSave} tabIndex="0">
                        {options.map((option, index) => (
                            <label key={index} className="checkbox-option">
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={inputValue.includes(option.value)}
                                    onChange={() => toggleSelection(option.value)}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                );
            case 'multiselect':
                return (
                    <div className="multiselect-container">
                        {options.map((option, index) => (
                            <label key={index} className="multiselect-option">
                                <input
                                    type="checkbox"
                                    checked={inputValue.includes(option.value)}
                                    onChange={() => toggleSelection(option.value)}
                                />
                                {option.label}
                            </label>
                        ))}
                        <button onClick={handleSave}>Guardar</button>
                    </div>
                );
            default:
                return null; // Manejo para tipos no soportados
        }
    };

    // Convertir la fecha cuando se pase el valor para que se vea correctamente
    useEffect(() => {
        if (type === 'date' && value) {
            setInputValue(formatDate(value));  // Solo convertimos si es tipo fecha
        } else {
            setInputValue(value);
        }
    }, [value, type]);

    return (
        <div className="editable-field">
            <label>{label}</label>
            <div className="editable-content">
                {isEditing ? (
                    renderInput()
                ) : (
                    <p onClick={() => setIsEditing(true)}>
                        {value || 'Sin datos'}
                    </p>
                )}
                {!isEditing && (
                    <img
                        src={EditarIcon}
                        alt="Editar"
                        className="edit-icon"
                        onClick={() => setIsEditing(true)}
                    />
                )}
            </div>
        </div>
    );
};

export default EditableField;
