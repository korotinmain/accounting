import React, { useState, useEffect } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { formatCurrency } from "../utils/formatters";
import { useSettings } from "../hooks/useSettings";
import "./Settings.css";
import LoadingState from "./LoadingState";

/**
 * Компонент сторінки налаштувань
 * @param {function} onBack - Callback для повернення до головної сторінки
 */
const Settings = ({ onBack }) => {
  const {
    personnelInitialBalance,
    operationalInitialBalance,
    loading,
    saving,
    saveSettings,
  } = useSettings();

  const [personnelInput, setPersonnelInput] = useState("");
  const [operationalInput, setOperationalInput] = useState("");

  // Ініціалізуємо поля після завантаження даних
  useEffect(() => {
    if (!loading) {
      setPersonnelInput(personnelInitialBalance.toString());
      setOperationalInput(operationalInitialBalance.toString());
    }
  }, [loading, personnelInitialBalance, operationalInitialBalance]);

  const handleSave = async () => {
    const success = await saveSettings(personnelInput, operationalInput);
    if (success) {
      // Можна додати додаткову логіку після успішного збереження
    }
  };

  const handlePersonnelChange = (e) => {
    const value = e.target.value;
    // Дозволяємо тільки числа, крапку, мінус та порожній рядок
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setPersonnelInput(value);
    }
  };

  const handleOperationalChange = (e) => {
    const value = e.target.value;
    // Дозволяємо тільки числа, крапку, мінус та порожній рядок
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setOperationalInput(value);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="settings-wrapper">
      <div className="settings-container">
        <div className="settings-header">
          <button className="btn-back" onClick={onBack} aria-label="Назад">
            <ArrowBackIcon />
          </button>
          <div className="settings-header-title">
            <SettingsIcon className="settings-icon" />
            <h1>Налаштування</h1>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2>Початкові баланси</h2>
            <p className="settings-description">
              Встановіть початкові баланси для розрахунку поточних показників
            </p>

            <div className="settings-form">
              {/* Баланс Персонал */}
              <div className="setting-item">
                <div className="setting-item-header">
                  <PeopleIcon className="setting-item-icon personnel-icon" />
                  <div className="setting-label">
                    <span className="setting-label-text">Персонал</span>
                    <span className="setting-label-hint">
                      Початковий баланс для розрахунків персоналу
                    </span>
                  </div>
                </div>
                <div className="setting-input-group">
                  <input
                    id="personnel-balance"
                    type="text"
                    value={personnelInput}
                    onChange={handlePersonnelChange}
                    className="setting-input"
                    placeholder="0"
                    disabled={saving}
                  />
                  <span className="setting-currency">грн</span>
                </div>
              </div>

              {/* Баланс Операційна */}
              <div className="setting-item">
                <div className="setting-item-header">
                  <BusinessCenterIcon className="setting-item-icon operational-icon" />
                  <div className="setting-label">
                    <span className="setting-label-text">Операційна</span>
                    <span className="setting-label-hint">
                      Початковий баланс для операційних витрат
                    </span>
                  </div>
                </div>
                <div className="setting-input-group">
                  <input
                    id="operational-balance"
                    type="text"
                    value={operationalInput}
                    onChange={handleOperationalChange}
                    className="setting-input"
                    placeholder="0"
                    disabled={saving}
                  />
                  <span className="setting-currency">грн</span>
                </div>
              </div>
            </div>

            {/* Попередній перегляд */}
            <div className="settings-preview">
              <h3>Поточні значення:</h3>
              <div className="preview-values">
                <div className="preview-item personnel-preview">
                  <div className="preview-label">
                    <PeopleIcon className="preview-icon" />
                    <span>Персонал:</span>
                  </div>
                  <strong>{formatCurrency(personnelInitialBalance)}</strong>
                </div>
                <div className="preview-item operational-preview">
                  <div className="preview-label">
                    <BusinessCenterIcon className="preview-icon" />
                    <span>Операційна:</span>
                  </div>
                  <strong>{formatCurrency(operationalInitialBalance)}</strong>
                </div>
              </div>
            </div>

            {/* Кнопка збереження */}
            <div className="settings-actions">
              <button
                className="btn-save-settings"
                onClick={handleSave}
                disabled={saving}
              >
                <SaveIcon />
                {saving ? "Збереження..." : "Зберегти налаштування"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
