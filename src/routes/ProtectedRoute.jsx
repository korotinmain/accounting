import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Компонент для захисту роутів
 * Перевіряє чи обрано лікаря перед доступом до сторінки
 * @param {Object} props - Пропси
 * @param {ReactNode} props.children - Дочірні елементи
 * @param {string} props.selectedDoctor - Ім'я вибраного лікаря
 */
const ProtectedRoute = ({ children, selectedDoctor }) => {
  if (!selectedDoctor) {
    // Якщо лікар не обраний, перенаправляємо на сторінку вибору лікаря
    return <Navigate to="/doctor-selection" replace />;
  }

  return children;
};

export default ProtectedRoute;
