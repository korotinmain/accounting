import React from "react";
import "../../assets/components/IconWithLabel.css";

/**
 * Компонент іконки з текстом
 * @param {ReactNode} icon - Іконка
 * @param {string} label - Текст
 * @param {string} description - Опис (опціонально)
 * @param {string} variant - Варіант кольору: 'primary', 'secondary', 'success', 'danger'
 * @param {string} className - Додаткові класи
 */
const IconWithLabel = ({
  icon,
  label,
  description,
  variant = "primary",
  className = "",
}) => {
  return (
    <div className={`icon-with-label icon-with-label-${variant} ${className}`}>
      <div className="icon-with-label-icon">{icon}</div>
      <div className="icon-with-label-content">
        <span className="icon-with-label-text">{label}</span>
        {description && (
          <span className="icon-with-label-description">{description}</span>
        )}
      </div>
    </div>
  );
};

export default IconWithLabel;
