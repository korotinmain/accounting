import React from "react";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import StyledButton from "./StyledButton";
import "./Header.css";

/**
 * Компонент заголовку додатку
 * @param {string} doctorName - Ім'я вибраного лікаря
 * @param {function} onLogout - Callback для виходу
 * @param {function} onSettings - Callback для відкриття налаштувань
 */
const Header = ({ doctorName, onLogout, onSettings }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-icon">
          <AccountBalanceWalletIcon />
        </div>
        <div className="header-text">
          <h1>Облік Фінансів</h1>
          <p className="header-subtitle">Управління вашими фінансами</p>
        </div>
      </div>
      {doctorName && (
        <div className="header-user">
          <div className="user-info">
            <PersonIcon className="user-icon" />
            <span className="user-name">{doctorName}</span>
          </div>
          <div className="header-actions">
            <StyledButton
              iconOnly
              variant="primary"
              onClick={onSettings}
              title="Налаштування"
            >
              <SettingsIcon />
            </StyledButton>
            <StyledButton
              iconOnly
              variant="danger"
              onClick={onLogout}
              title="Вийти"
            >
              <LogoutIcon />
            </StyledButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
