import React from "react";
import "../../assets/components/FormInput.css";

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
 * @param {string} suffix - Текст після інпуту (наприклад "грн")
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
  suffix,
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
          className={`form-input ${icon ? "has-icon" : ""} ${suffix ? "has-suffix" : ""} ${error ? "has-error" : ""}`}
          {...props}
        />

        {suffix && <div className="form-input-suffix">{suffix}</div>}
      </div>

      {error && <div className="form-input-error">{error}</div>}
      {hint && !error && <div className="form-input-hint">{hint}</div>}
    </div>
  );
};

export default FormInput;
