import React from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { formatCurrency } from "../utils/formatters";
import "./BalanceCards.css";

/**
 * Компонент карток балансу (початковий та поточний)
 * @param {number} initialBalance - Початковий баланс
 * @param {number} currentBalance - Поточний баланс
 * @param {boolean} editingBalance - Чи в режимі редагування
 * @param {string} balanceInput - Значення input для редагування
 * @param {function} onBalanceInputChange - Callback для зміни input
 * @param {function} onStartEdit - Callback для початку редагування
 * @param {function} onSaveBalance - Callback для збереження
 * @param {function} onCancelEdit - Callback для скасування
 */
const BalanceCards = ({
  initialBalance,
  currentBalance,
  editingBalance,
  balanceInput,
  onBalanceInputChange,
  onStartEdit,
  onSaveBalance,
  onCancelEdit,
}) => {
  const balanceDiff = currentBalance - initialBalance;
  const percentChange =
    initialBalance !== 0 ? (balanceDiff / initialBalance) * 100 : 0;

  return (
    <div className="balance-cards">
      {/* Початковий баланс */}
      <div className="balance-card initial-balance">
        <div className="balance-card-header">
          <div className="balance-card-icon">
            <AccountBalanceIcon />
          </div>
          <span className="balance-card-title">Початковий баланс</span>
          {!editingBalance && (
            <button
              className="btn-edit-balance"
              onClick={onStartEdit}
              aria-label="Редагувати початковий баланс"
              title="Редагувати"
            >
              <EditIcon style={{ fontSize: "1em" }} />
              <span className="btn-text-mobile">Ред.</span>
            </button>
          )}
        </div>

        {!editingBalance ? (
          <div className="balance-card-amount">
            {formatCurrency(initialBalance)}
            <span className="balance-currency">грн</span>
          </div>
        ) : (
          <div className="balance-edit-inline">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={balanceInput}
              onChange={(e) => onBalanceInputChange(e.target.value)}
              placeholder="Введіть баланс"
              aria-label="Початковий баланс"
              autoFocus
            />
            <div className="balance-edit-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={onCancelEdit}
              >
                <CloseIcon style={{ fontSize: "1em" }} />
                <span>Скасувати</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={onSaveBalance}
              >
                <SaveIcon style={{ fontSize: "1em" }} />
                <span>Зберегти</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Поточний баланс */}
      <div className="balance-card current-balance">
        <div className="balance-card-header">
          <div className="balance-card-icon current">
            <TrendingUpIcon />
          </div>
          <span className="balance-card-title">Поточний залишок</span>
        </div>
        <div className="balance-card-amount current">
          {formatCurrency(currentBalance)}
          <span className="balance-currency">грн</span>
        </div>
        <div
          className={`balance-trend ${balanceDiff >= 0 ? "positive" : "negative"}`}
        >
          <span className="trend-label">
            {balanceDiff >= 0 ? "▲" : "▼"}{" "}
            {formatCurrency(Math.abs(balanceDiff))} грн
          </span>
          <span className="trend-percent">
            ({percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCards;
