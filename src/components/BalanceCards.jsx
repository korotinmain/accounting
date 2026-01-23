import React from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { formatCurrency } from "../utils/formatters";
import StyledButton from "./StyledButton";
import { Card } from "./common";
import "../assets/components/BalanceCards.css";

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
      <Card variant="elevated" className="balance-card initial-balance">
        <div className="balance-card-header">
          <div className="balance-card-icon">
            <AccountBalanceIcon />
          </div>
          <span className="balance-card-title">Початковий баланс</span>
          {!editingBalance && (
            <StyledButton
              iconOnly
              variant="text"
              size="small"
              onClick={onStartEdit}
              title="Редагувати"
            >
              <EditIcon />
            </StyledButton>
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
              <StyledButton
                variant="outlined"
                size="small"
                startIcon={<CloseIcon />}
                onClick={onCancelEdit}
              >
                Скасувати
              </StyledButton>
              <StyledButton
                variant="success"
                size="small"
                startIcon={<SaveIcon />}
                onClick={onSaveBalance}
              >
                Зберегти
              </StyledButton>
            </div>
          </div>
        )}
      </Card>

      {/* Поточний баланс */}
      <Card variant="elevated" className="balance-card current-balance">
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
      </Card>
    </div>
  );
};

export default BalanceCards;
