import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Guard для перевірки чи вже обрано лікаря
 * Якщо так - перенаправляє на головну сторінку
 * @param {Object} props - Пропси
 * @param {ReactNode} props.children - Дочірні елементи
 * @param {string} props.selectedDoctor - Ім'я вибраного лікаря
 */
const DoctorGuard = ({ children, selectedDoctor }) => {
  if (selectedDoctor) {
    // Якщо лікар вже обраний, перенаправляємо на головну
    return <Navigate to="/" replace />;
  }

  return children;
};

export default DoctorGuard;
