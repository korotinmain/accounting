import React from "react";
import "../../assets/components/ModalSummary.css";
import { formatCurrency } from "../../utils/formatters";

/**
 * Панель підсумку в модальному вікні
 * @param {number} totalDeposits - Сума депозитів
 * @param {number} totalWithdrawals - Сума знімань
 * @param {number} balance - Баланс
 */
const ModalSummary = ({ totalDeposits, totalWithdrawals, balance }) => {
  return (
    <div className="modal-summary">
      <div className="modal-summary-item modal-summary-deposits">
        <span className="modal-summary-label">Депозити:</span>
        <span className="modal-summary-value">
          {formatCurrency(totalDeposits)}
        </span>
      </div>
      <div className="modal-summary-item modal-summary-withdrawals">
        <span className="modal-summary-label">Зняття:</span>
        <span className="modal-summary-value">
          {formatCurrency(totalWithdrawals)}
        </span>
      </div>
      <div className="modal-summary-item modal-summary-balance">
        <span className="modal-summary-label">Баланс:</span>
        <span
          className={`modal-summary-value ${balance >= 0 ? "positive" : "negative"}`}
        >
          {formatCurrency(balance)}
        </span>
      </div>
    </div>
  );
};

export default ModalSummary;
