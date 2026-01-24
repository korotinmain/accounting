import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../utils/formatters";
import StyledButton from "./StyledButton";
import "../assets/components/EntriesTable.css";

/**
 * Компонент таблиці записів грошей
 * @param {Array} entries - Масив записів загальних надходжень
 * @param {Array} personnelEntries - Масив записів витрат на персонал
 * @param {function} onEdit - Callback для редагування запису
 * @param {function} onDelete - Callback для видалення запису
 * @param {function} onEditPersonnel - Callback для редагування запису персоналу
 * @param {function} onDeletePersonnel - Callback для видалення запису персоналу
 */
const EntriesTable = ({
  entries,
  personnelEntries = [],
  onEdit,
  onDelete,
  onEditPersonnel,
  onDeletePersonnel,
}) => {
  if (
    (!entries || entries.length === 0) &&
    (!personnelEntries || personnelEntries.length === 0)
  ) {
    return (
      <div className="entries-table-empty">
        <p>Немає записів за цей місяць</p>
      </div>
    );
  }

  const total = entries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const personnelTotal =
    personnelEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

  // Форматування дати
  const formatDate = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="entries-table-container">
      {/* Таблиця загальних надходжень */}
      {entries && entries.length > 0 && (
        <>
          <h3 className="table-section-title">Загальне</h3>
          <table className="entries-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>ПІБ</th>
                <th>Сума</th>
                {onDelete && <th>Дії</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.id || `entry-${index}`}
                  onClick={(e) => {
                    if (
                      e.target.closest(".delete-btn") ||
                      e.target.closest(".entry-actions")
                    ) {
                      return;
                    }
                    if (onEdit) {
                      onEdit(entry.id);
                    }
                  }}
                  className={onEdit ? "clickable-row" : ""}
                >
                  <td className="entry-number">{index + 1}</td>
                  <td className="entry-date">{formatDate(entry.date)}</td>
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
                          onDelete(entry.id || entry);
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
                <td colSpan="2">Всього:</td>
                <td className="hidden-cell" colSpan="1"></td>
                <td colSpan="2" className="total-amount">
                  {formatCurrency(total)} грн
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      {/* Таблиця витрат на персонал */}
      {personnelEntries && personnelEntries.length > 0 && (
        <>
          <h3 className="table-section-title personnel-section-title">
            Персонал
          </h3>
          <table className="entries-table personnel-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>ПІБ</th>
                <th>Сума</th>
                {onDeletePersonnel && <th>Дії</th>}
              </tr>
            </thead>
            <tbody>
              {personnelEntries.map((entry, index) => (
                <tr
                  key={entry.id || `personnel-${index}`}
                  onClick={(e) => {
                    if (
                      e.target.closest(".delete-btn") ||
                      e.target.closest(".entry-actions")
                    ) {
                      return;
                    }
                    if (onEditPersonnel) {
                      onEditPersonnel(entry.id);
                    }
                  }}
                  className={onEditPersonnel ? "clickable-row" : ""}
                >
                  <td className="entry-number">{index + 1}</td>
                  <td className="entry-date">{formatDate(entry.date)}</td>
                  <td className="entry-name">
                    <PersonIcon className="entry-icon" />
                    <span>{entry.name}</span>
                  </td>
                  <td className="entry-amount personnel-amount">
                    {formatCurrency(entry.amount)} грн
                  </td>
                  {onDeletePersonnel && (
                    <td className="entry-actions">
                      <StyledButton
                        iconOnly
                        variant="danger"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePersonnel(entry.id || entry);
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
              <tr className="total-row personnel-total-row">
                <td colSpan="2">Всього:</td>
                <td className="hidden-cell" colSpan="1"></td>
                <td colSpan="2" className="total-amount">
                  {formatCurrency(personnelTotal)} грн
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
};

export default EntriesTable;
