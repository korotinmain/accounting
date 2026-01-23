import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "../components/Settings";

/**
 * Сторінка налаштувань з роутінгом
 * @param {function} onSettingsUpdate - Callback після оновлення налаштувань
 */
const SettingsPage = ({ onSettingsUpdate }) => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    // Викликаємо callback для оновлення балансів
    if (onSettingsUpdate) {
      onSettingsUpdate();
    }
    // Повертаємось на головну
    navigate("/");
  }, [navigate, onSettingsUpdate]);

  return <Settings onBack={handleBack} />;
};

export default SettingsPage;
