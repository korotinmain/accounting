import React, { useState, useEffect } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { formatCurrency } from "../utils/formatters";
import { useSettings } from "../hooks/useSettings";
import StyledButton from "./StyledButton";
import { FormInput, IconWithLabel } from "./common";
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
          <StyledButton
            variant="outlined"
            size="medium"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            className="btn-back-styled"
          >
            Назад
          </StyledButton>
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
                <IconWithLabel
                  icon={<PeopleIcon />}
                  label="Персонал"
                  description="Початковий баланс для розрахунків персоналу"
                  variant="primary"
                />
                <FormInput
                  id="personnel-balance"
                  type="number"
                  value={personnelInput}
                  onChange={handlePersonnelChange}
                  placeholder="0"
                  disabled={saving}
                  hint="грн"
                />
              </div>

              {/* Баланс Операційна */}
              <div className="setting-item">
                <IconWithLabel
                  icon={<BusinessCenterIcon />}
                  label="Операційна"
                  description="Початковий баланс для операційних витрат"
                  variant="secondary"
                />
                <FormInput
                  id="operational-balance"
                  type="number"
                  value={operationalInput}
                  onChange={handleOperationalChange}
                  placeholder="0"
                  disabled={saving}
                  hint="грн"
                />
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
              <StyledButton
                variant="success"
                size="large"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Збереження..." : "Зберегти налаштування"}
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
