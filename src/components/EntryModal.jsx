import React, { useState, useCallback, useEffect } from "react";
import Modal from "react-modal";
import DatePicker, { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Swal from "sweetalert2";
import StyledButton from "./StyledButton";
import { FormInput } from "./common";
import { SWAL_CONFIG, MESSAGES } from "../utils/constants";
import {
  validateRequired,
  validateNumber,
  sanitizeNumber,
} from "../utils/validation";
import "../assets/components/AddDayModal.css";
import "../assets/components/DatePicker.css";

// Реєструємо українську локаль
registerLocale("uk", uk);

/**
 * Модальне вікно для додавання/редагування запису
 * @param {boolean} isOpen - Чи відкрите модальне вікно
 * @param {function} onClose - Callback для закриття
 * @param {function} onSave - Callback для збереження
 * @param {Object} editingEntry - Запис для редагування (якщо є)
 * @param {string} doctorName - Ім'я лікаря для відображення
 */
const EntryModal = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  doctorName = "",
}) => {
  const [date, setDate] = useState(new Date());
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");

  // Заповнюємо форму при редагуванні entry
  useEffect(() => {
    if (editingEntry) {
      setPersonName(editingEntry.name || "");
      setAmount(editingEntry.amount ? String(editingEntry.amount) : "");
      if (editingEntry.date) {
        const dateObj =
          editingEntry.date instanceof Date
            ? editingEntry.date
            : new Date(editingEntry.date);
        setDate(dateObj);
      }
    } else {
      setDate(new Date());
      setPersonName("");
      setAmount("");
    }
  }, [editingEntry, isOpen]);

  const handleClose = useCallback(() => {
    setDate(new Date());
    setPersonName("");
    setAmount("");
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    // Валідація
    if (!editingEntry && !validateRequired(personName) && !doctorName) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть ПІБ",
        text: "Будь ласка, введіть ПІБ перед збереженням.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    if (!validateRequired(amount)) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть суму",
        text: "Будь ласка, введіть суму перед збереженням.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    if (!validateNumber(amount)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректна сума",
        text: MESSAGES.ERRORS.INVALID_AMOUNT,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    const sanitizedAmount = sanitizeNumber(amount);
    const dateString = date.toISOString().split("T")[0];
    const entryData = {
      name: editingEntry ? personName.trim() : personName.trim() || doctorName,
      amount: sanitizedAmount,
      date: dateString,
      ...(editingEntry && { id: editingEntry.id, dayId: editingEntry.dayId }),
    };

    onSave(entryData);
    handleClose();
  }, [date, personName, amount, editingEntry, doctorName, onSave, handleClose]);

  const handleQuickAmount = useCallback((quickAmount) => {
    setAmount(String(quickAmount));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={editingEntry ? "Редагувати запис" : "Додати запис"}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>{editingEntry ? "Редагувати запис" : "Додати до загального"}</h3>
        <StyledButton
          iconOnly
          variant="text"
          onClick={handleClose}
          title="Закрити"
        >
          <CloseIcon />
        </StyledButton>
      </div>

      <div className="modal-body">
        {doctorName && !editingEntry && (
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label style={{ color: "#6b7280", fontWeight: "500" }}>Лікар</label>
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                color: "#1f2937",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <PersonIcon style={{ fontSize: "1.2em", color: "#6b7280" }} />
              {doctorName}
            </div>
          </div>
        )}

        {editingEntry && (
          <FormInput
            label="ПІБ"
            id="name-input"
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Введіть ПІБ"
            className="mb-lg"
          />
        )}

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              color: "#475569",
              fontWeight: "600",
              fontSize: "0.9em",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Дата
          </label>
          <div style={{ position: "relative" }}>
            <DatePicker
              selected={date}
              onChange={(selectedDate) => setDate(selectedDate || new Date())}
              dateFormat="dd.MM.yyyy"
              locale="uk"
              wrapperClassName="datepicker-wrapper"
              calendarClassName="custom-calendar"
              showPopperArrow={false}
              portalId="root-portal"
            />
            <CalendarTodayIcon
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6366f1",
                fontSize: "1.2em",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <FormInput
          label="Сума"
          id="amount-input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="mb-lg"
        />

        <div className="quick-amounts mb-lg">
          {[250, 500, 750, 1000].map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              className="quick-amount-btn"
              onClick={() => handleQuickAmount(quickAmount)}
            >
              {quickAmount}
            </button>
          ))}
        </div>
      </div>

      <div className="modal-footer">
        <StyledButton
          variant="outlined"
          size="large"
          startIcon={<CloseIcon />}
          onClick={handleClose}
        >
          Скасувати
        </StyledButton>
        <StyledButton
          variant="success"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Зберегти
        </StyledButton>
      </div>
    </Modal>
  );
};

export default EntryModal;
