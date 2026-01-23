import React from "react";
import "./FormInput.css";

/**
 * Реюзабл компонент для інпутів форми
 * @param {string} label - Мітка поля
 * @param {string} id - ID інпуту
 * @param {string} type - Тип інпуту
 * @param {string} value - Значення
 * @param {function} onChange - Обробник зміни
 * @param {string} placeholder - Плейсхолдер
 * @param {boolean} disabled - Чи вимкнено
 * @param {string} error - Текст помилки
 * @param {string} hint - Підказка
 * @param {ReactNode} icon - Іконка
 * @param {string} className - Додаткові класи
 */
const FormInput = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  hint,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className={`form-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="form-input-label">
          {label}
        </label>
      )}

      <div className="form-input-container">
        {icon && <div className="form-input-icon">{icon}</div>}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${icon ? "has-icon" : ""} ${error ? "has-error" : ""}`}
          {...props}
        />
      </div>

      {error && <div className="form-input-error">{error}</div>}
      {hint && !error && <div className="form-input-hint">{hint}</div>}
    </div>
  );
};

export default FormInput;
