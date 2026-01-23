import React, { useState, useCallback } from "react";
import Modal from "react-modal";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { SWAL_CONFIG } from "../constants";
import {
  validateRequired,
  validateNumber,
  sanitizeNumber,
} from "../utils/validation";
import "./PersonnelModal.css";

/**
 * Модальне вікно для додавання суми персоналу
 * @param {boolean} isOpen - Чи відкрите модальне вікно
 * @param {function} onClose - Callback для закриття
 * @param {function} onSave - Callback для збереження
 * @param {string} selectedDate - Вибрана дата
 */
const PersonnelModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [personnelAmount, setPersonnelAmount] = useState("");

  const handleSave = useCallback(() => {
    if (!validateRequired(personnelAmount)) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть поле",
        text: "Будь ласка, введіть суму персоналу.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    if (!validateNumber(personnelAmount)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректна сума",
        text: "Будь ласка, введіть коректне число.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    const amount = sanitizeNumber(personnelAmount);

    if (amount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Некоректна сума",
        text: "Сума має бути більше нуля.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    onSave({
      dateString: selectedDate,
      personnel: amount,
      entries: [],
    });

    setPersonnelAmount("");
  }, [personnelAmount, selectedDate, onSave]);

  const handleClose = useCallback(() => {
    setPersonnelAmount("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Додати суму персоналу"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>Додати суму персоналу</h3>
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Закрити"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="modal-body">
        {/* Показуємо дату */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>Дата</label>
          <div className="date-display">
            {new Date(selectedDate).toLocaleDateString("uk-UA", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Поле для суми */}
        <div className="form-group">
          <label htmlFor="personnel-amount-input">Сума персоналу</label>
          <input
            id="personnel-amount-input"
            type="number"
            placeholder="Введіть суму"
            value={personnelAmount}
            onChange={(e) => setPersonnelAmount(e.target.value)}
            className="personnel-amount-input"
            step="1"
            min="0"
            autoFocus
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={handleClose}>
          <CloseIcon style={{ fontSize: "1.1em", marginRight: "6px" }} />
          Скасувати
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <SaveIcon style={{ fontSize: "1.1em", marginRight: "6px" }} />
          Зберегти
        </button>
      </div>
    </Modal>
  );
};

export default PersonnelModal;
