import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../utils/formatters";
import StyledButton from "./StyledButton";
import "../assets/components/EntriesTable.css";

/**
 * Компонент таблиці записів грошей
 * @param {Array} entries - Масив записів
 * @param {number} personnelAmount - Сума персоналу
 * @param {function} onEdit - Callback для редагування запису
 * @param {function} onDelete - Callback для видалення запису
 */
const EntriesTable = ({ entries, personnelAmount = 0, onEdit, onDelete }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="entries-table-empty">
        <p>Немає записів за цю дату</p>
      </div>
    );
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="entries-table-container">
      <table className="entries-table">
        <thead>
          <tr>
            <th>№</th>
            <th>ПІБ</th>
            <th>Сума</th>
            {onDelete && <th>Дії</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={`entry-${index}`}
              onClick={(e) => {
                // Не викликати onEdit якщо клікнули на кнопку видалення
                if (
                  e.target.closest(".delete-btn") ||
                  e.target.closest(".entry-actions")
                ) {
                  return;
                }
                if (onEdit) {
                  onEdit(entry, index);
                }
              }}
              className={onEdit ? "clickable-row" : ""}
            >
              <td className="entry-number">{index + 1}</td>
              <td className="entry-name">
                <PersonIcon className="entry-icon" />
                <span>{entry.name}</span>
              </td>
              <td className="entry-amount">
                {formatCurrency(entry.amount)} грн
              </td>
              {onDelete && (
                <td className="entry-actions">
                  <StyledButton
                    iconOnly
                    variant="danger"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry, index);
                    }}
                    title="Видалити"
                  >
                    <DeleteIcon />
                  </StyledButton>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="1">Всього:</td>
            <td className="hidden-cell" colSpan="1"></td>
            <td colSpan="2" className="total-amount">
              {formatCurrency(total)} грн
            </td>
          </tr>
          {personnelAmount > 0 && (
            <tr className="personnel-item-row">
              <td colSpan="1" className="personnel-item-label">
                Персонал:
              </td>
              <td className="hidden-cell" colSpan="1"></td>
              <td colSpan="2" className="personnel-item-amount">
                {formatCurrency(personnelAmount)} грн
              </td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
};

export default EntriesTable;
