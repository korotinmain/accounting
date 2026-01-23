import React from "react";
import "../../assets/components/EntryList.css";
import StyledButton from "../StyledButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../../utils/formatters";

/**
 * Список записів (депозитів або знімань)
 * @param {array} entries - Масив записів
 * @param {function} onDeleteEntry - Видалити запис
 * @param {string} emptyMessage - Повідомлення коли список порожній
 */
const EntryList = ({
  entries = [],
  onDeleteEntry,
  emptyMessage = "Немає записів",
}) => {
  if (entries.length === 0) {
    return (
      <div className="entry-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="entry-list">
      {entries.map((entry, index) => (
        <div key={index} className="entry-list-item">
          <div className="entry-list-item-info">
            <span className="entry-list-item-name">{entry.name}</span>
            <span className="entry-list-item-amount">
              {formatCurrency(entry.amount)}
            </span>
          </div>
          <StyledButton
            variant="danger"
            size="small"
            iconOnly
            icon={<DeleteIcon />}
            onClick={() => onDeleteEntry(index)}
            className="entry-list-item-delete"
          />
        </div>
      ))}
    </div>
  );
};

export default EntryList;
