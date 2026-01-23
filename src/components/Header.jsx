import React from "react";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import "./Header.css";

/**
 * Компонент заголовку додатку
 * @param {string} doctorName - Ім'я вибраного лікаря
 * @param {function} onLogout - Callback для виходу
 */
const Header = ({ doctorName, onLogout }) => {
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
          <button className="logout-btn" onClick={onLogout} title="Вийти">
            <LogoutIcon />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
