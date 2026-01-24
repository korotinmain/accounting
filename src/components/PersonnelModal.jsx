import React, { useState, useCallback, useEffect } from "react";
import Modal from "react-modal";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import Swal from "sweetalert2";
import StyledButton from "./StyledButton";
import { FormInput, DatePickerField } from "./common";
import { SWAL_CONFIG } from "../utils/constants";
import {
  validateRequired,
  validateNumber,
  sanitizeNumber,
} from "../utils/validation";
import "../assets/components/PersonnelModal.css";

/**
 * Модальне вікно для додавання/редагування витрат на персонал
 * @param {boolean} isOpen - Чи відкрите модальне вікно
 * @param {function} onClose - Callback для закриття
 * @param {function} onSave - Callback для збереження
 * @param {Object} editingPersonnel - Запис персоналу для редагування (якщо є)
 * @param {string} doctorName - Ім'я лікаря для автозаповнення
 * @param {Date} selectedMonth - Вибраний місяць для defaultDate
 */
const PersonnelModal = ({
  isOpen,
  onClose,
  onSave,
  editingPersonnel,
  doctorName = "",
  selectedMonth = new Date(),
}) => {
  const [date, setDate] = useState(selectedMonth);
  const [personName, setPersonName] = useState(doctorName);
  const [personnelAmount, setPersonnelAmount] = useState("");

  // Заповнюємо форму при редагуванні
  useEffect(() => {
    if (editingPersonnel) {
      setPersonName(editingPersonnel.name || "");
      setPersonnelAmount(
        editingPersonnel.amount ? String(editingPersonnel.amount) : "",
      );
      if (editingPersonnel.date) {
        const dateObj =
          editingPersonnel.date instanceof Date
            ? editingPersonnel.date
            : new Date(editingPersonnel.date);
        setDate(dateObj);
      }
    } else {
      // При створенні нового запису використовуємо вибраний місяць і ім'я лікаря
      setDate(selectedMonth);
      setPersonName(doctorName);
      setPersonnelAmount("");
    }
  }, [editingPersonnel, isOpen, doctorName, selectedMonth]);

  const handleSave = useCallback(() => {
    // Валідація ПІБ
    if (!validateRequired(personName)) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть ПІБ",
        text: "Будь ласка, введіть ПІБ перед збереженням.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    // Валідація суми
    if (!validateRequired(personnelAmount)) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть суму",
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

    // Формуємо дані для збереження
    const personnelData = {
      name: personName.trim(),
      amount,
      date: date.toISOString().split("T")[0],
    };

    // Якщо редагуємо, передаємо також id та dayId
    if (editingPersonnel) {
      personnelData.id = editingPersonnel.id;
      personnelData.dayId = editingPersonnel.dayId;
    }

    onSave(personnelData);

    setPersonName(doctorName);
    setPersonnelAmount("");
    setDate(selectedMonth);
  }, [
    personName,
    personnelAmount,
    date,
    editingPersonnel,
    onSave,
    doctorName,
    selectedMonth,
  ]);

  const handleClose = useCallback(() => {
    setDate(selectedMonth);
    setPersonName(doctorName);
    setPersonnelAmount("");
    onClose();
  }, [onClose, selectedMonth, doctorName]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={
        editingPersonnel
          ? "Редагувати витрати на персонал"
          : "Додати витрати на персонал"
      }
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>
          {editingPersonnel
            ? "Редагувати витрати на персонал"
            : "Додати витрати на персонал"}
        </h3>
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
        {/* Поле для ПІБ */}
        <FormInput
          label="ПІБ"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Введіть ПІБ"
          icon={<PersonIcon />}
          disabled
          required
        />

        {/* Поле для дати */}
        <DatePickerField
          label="Дата"
          id="personnel-date-input"
          selected={date}
          onChange={setDate}
          required
        />

        {/* Поле для суми */}
        <FormInput
          label="Сума"
          type="number"
          value={personnelAmount}
          onChange={(e) => setPersonnelAmount(e.target.value)}
          placeholder="Введіть суму"
          min="0"
          step="1"
          required
        />
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

export default PersonnelModal;
