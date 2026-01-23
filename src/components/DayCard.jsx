import React from "react";
import EventIcon from "@mui/icons-material/Event";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { formatDate, formatCurrency } from "../utils/formatters";
import "./DayCard.css";

/**
 * Компонент картки дня
 * @param {Object} day - Дані дня
 * @param {string} activeTab - Активна вкладка ('personnel' або 'operational')
 * @param {function} onEdit - Callback для редагування
 * @param {function} onDelete - Callback для видалення
 */
const DayCard = ({ day, activeTab, onEdit, onDelete }) => {
  const totalDeposits = day.entries?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalWithdrawals =
    day.withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

  let finalTotal;
  if (activeTab === "operational") {
    finalTotal = totalDeposits - totalWithdrawals;
  } else {
    // Для personnel: тільки поклади
    finalTotal = totalDeposits;
  }

  return (
    <div className="day-card-compact">
      <div className="day-header-compact">
        <div className="day-date-compact">
          <EventIcon style={{ fontSize: "1em", marginRight: "6px" }} />
          {formatDate(day.date)}
        </div>
        <div className="day-actions-compact">
          <button
            className="btn-icon-compact btn-edit"
            onClick={() => onEdit(day)}
            aria-label="Редагувати день"
            title="Редагувати"
          >
            <EditNoteIcon style={{ fontSize: "1.1em" }} />
          </button>
          <button
            className="btn-icon-compact btn-delete"
            onClick={() => onDelete(day.id)}
            aria-label="Видалити день"
            title="Видалити"
          >
            <DeleteOutlineIcon style={{ fontSize: "1.1em" }} />
          </button>
        </div>
      </div>

      <div className="day-content-compact">
        {/* Поклали */}
        {day.entries && day.entries.length > 0 && (
          <div className="entries-section-compact deposits">
            <div className="section-header-compact">
              <AddCircleIcon style={{ fontSize: "0.9em" }} />
              <span>Поклали:</span>
            </div>
            <div className="entries-list-compact">
              {day.entries.map((entry, index) => (
                <div key={`entry-${index}`} className="entry-row-compact">
                  <PersonIcon
                    style={{
                      fontSize: "0.9em",
                      marginRight: "6px",
                      color: "#10b981",
                    }}
                  />
                  <span className="entry-name-compact">{entry.name}</span>
                  <span className="entry-amount-compact positive">
                    +{formatCurrency(entry.amount)} грн
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Зняли (тільки для operational) */}
        {activeTab === "operational" &&
          day.withdrawals &&
          day.withdrawals.length > 0 && (
            <div className="entries-section-compact withdrawals">
              <div className="section-header-compact">
                <RemoveCircleIcon style={{ fontSize: "0.9em" }} />
                <span>Зняли:</span>
              </div>
              <div className="entries-list-compact">
                {day.withdrawals.map((withdrawal, index) => (
                  <div
                    key={`withdrawal-${index}`}
                    className="entry-row-compact"
                  >
                    <PersonIcon
                      style={{
                        fontSize: "0.9em",
                        marginRight: "6px",
                        color: "#ef4444",
                      }}
                    />
                    <span className="entry-name-compact">
                      {withdrawal.name}
                    </span>
                    <span className="entry-amount-compact negative">
                      -{formatCurrency(withdrawal.amount)} грн
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      <div className="day-footer-compact">
        <span className="total-label-compact">Загалом:</span>
        <span
          className={`total-amount-compact ${finalTotal >= 0 ? "positive" : "negative"}`}
        >
          {finalTotal >= 0 ? "+" : ""}
          {formatCurrency(finalTotal)} грн
        </span>
      </div>
    </div>
  );
};

export default DayCard;
