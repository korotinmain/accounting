import React from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import "./StyledButton.css";

/**
 * Стилізована кнопка з використанням MUI
 * @param {string} variant - Варіант кнопки: 'primary', 'secondary', 'outlined', 'text', 'danger', 'success'
 * @param {string} size - Розмір: 'small', 'medium', 'large'
 * @param {boolean} fullWidth - Кнопка на всю ширину
 * @param {ReactNode} startIcon - Іконка на початку
 * @param {ReactNode} endIcon - Іконка в кінці
 * @param {boolean} iconOnly - Тільки іконка (IconButton)
 * @param {string} className - Додаткові CSS класи
 * @param {function} onClick - Обробник кліку
 * @param {boolean} disabled - Вимкнена кнопка
 * @param {ReactNode} children - Вміст кнопки
 */
const StyledButton = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  startIcon,
  endIcon,
  iconOnly = false,
  className = "",
  onClick,
  disabled = false,
  children,
  ...props
}) => {
  // Для кнопок тільки з іконкою
  if (iconOnly) {
    return (
      <IconButton
        className={`styled-icon-button styled-icon-button-${variant} ${className}`}
        onClick={onClick}
        disabled={disabled}
        size={size}
        {...props}
      >
        {children || startIcon}
      </IconButton>
    );
  }

  // Маппінг наших варіантів на MUI варіанти
  const getMuiVariant = () => {
    if (variant === "outlined") return "outlined";
    if (variant === "text") return "text";
    return "contained";
  };

  return (
    <Button
      variant={getMuiVariant()}
      className={`styled-button styled-button-${variant} styled-button-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StyledButton;
