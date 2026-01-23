import React from "react";
import "./Card.css";

/**
 * Реюзабл компонент картки
 * @param {ReactNode} children - Вміст картки
 * @param {string} variant - Варіант: 'default', 'elevated', 'outlined'
 * @param {string} className - Додаткові класи
 * @param {function} onClick - Обробник кліку
 */
const Card = ({
  children,
  variant = "default",
  className = "",
  onClick,
  ...props
}) => {
  return (
    <div
      className={`card card-${variant} ${className} ${onClick ? "card-clickable" : ""}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
