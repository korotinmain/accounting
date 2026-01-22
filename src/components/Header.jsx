import React from "react";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import "./Header.css";

/**
 * Компонент заголовку додатку
 */
const Header = () => {
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
    </header>
  );
};

export default Header;
