import React, { useState, useCallback, useMemo } from "react";
import Modal from "react-modal";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import Swal from "sweetalert2";
import StyledButton from "./StyledButton";
import { EntryForm, EntryList, ModalSummary } from "./modal-parts";
import { FormInput } from "./common";
import { SWAL_CONFIG, MESSAGES } from "../constants";
import {
  validateRequired,
  validateNumber,
  sanitizeNumber,
} from "../utils/validation";
import { getTodayString } from "../utils/dateUtils";
import "./AddDayModal.css";

/**
 * Модальне вікно для додавання/редагування дня
 * @param {boolean} isOpen - Чи відкрите модальне вікно
 * @param {function} onClose - Callback для закриття
 * @param {function} onSave - Callback для збереження
 * @param {Object} editingDay - День для редагування (якщо є)
 * @param {string} activeTab - Активна вкладка ('personnel' або 'operational')
 * @param {string} selectedDate - Вибрана дата
 * @param {string} operationType - Тип операції ('personnel' або 'income')
 * @param {string} doctorName - Ім'я лікаря для відображення
 */
const AddDayModal = ({
  isOpen,
  onClose,
  onSave,
  editingDay,
  activeTab,
  selectedDate,
  operationType = "income",
  doctorName = "",
}) => {
  const [newDate, setNewDate] = useState(
    editingDay?.dateString || selectedDate || getTodayString(),
  );
  const [newPersonName, setNewPersonName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [currentEntries, setCurrentEntries] = useState(
    editingDay?.entries || [],
  );
  const [currentWithdrawals, setCurrentWithdrawals] = useState(
    editingDay?.withdrawals || [],
  );
  const [modalTab, setModalTab] = useState("deposits");

  // Обчислення для summary панелі
  const totalDeposits = useMemo(() => {
    return currentEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [currentEntries]);

  const totalWithdrawals = useMemo(() => {
    return currentWithdrawals.reduce((sum, entry) => sum + entry.amount, 0);
  }, [currentWithdrawals]);

  const modalBalance = useMemo(() => {
    return totalDeposits - totalWithdrawals;
  }, [totalDeposits, totalWithdrawals]);

  const handleAddEntry = useCallback(() => {
    if (!validateRequired(newPersonName) || !validateRequired(newAmount)) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть поля",
        text: MESSAGES.ERRORS.EMPTY_NAME_AMOUNT,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    if (!validateNumber(newAmount)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректна сума",
        text: MESSAGES.ERRORS.INVALID_AMOUNT,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    const amount = sanitizeNumber(newAmount);

    if (activeTab === "operational" && modalTab === "withdrawals") {
      setCurrentWithdrawals((prev) => [
        ...prev,
        { name: newPersonName.trim(), amount: amount },
      ]);
    } else {
      setCurrentEntries((prev) => [
        ...prev,
        { name: newPersonName.trim(), amount: amount },
      ]);
    }
    setNewPersonName("");
    setNewAmount("");
  }, [newPersonName, newAmount, activeTab, modalTab]);

  const handleRemoveEntry = useCallback((index) => {
    setCurrentEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveWithdrawal = useCallback((index) => {
    setCurrentWithdrawals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    // Для спрощеного режиму income
    if (operationType === "income" && activeTab === "personnel") {
      if (!validateRequired(newAmount)) {
        Swal.fire({
          icon: "warning",
          title: "Заповніть суму",
          text: "Будь ласка, введіть суму перед збереженням.",
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
        return;
      }

      if (!validateNumber(newAmount)) {
        Swal.fire({
          icon: "warning",
          title: "Некоректна сума",
          text: MESSAGES.ERRORS.INVALID_AMOUNT,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
        return;
      }

      const amount = sanitizeNumber(newAmount);
      const dayData = {
        dateString: newDate,
        entries: [{ name: doctorName, amount: amount }],
        personnel: 0,
      };
      onSave(dayData);
      return;
    }

    // Валідація для інших режимів
    if (
      activeTab === "personnel"
        ? currentEntries.length === 0
        : currentEntries.length === 0 && currentWithdrawals.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Додайте записи",
        text: "Будь ласка, додайте хоча б один запис перед збереженням.",
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    const dayData = {
      dateString: newDate,
      entries: currentEntries,
      personnel: 0,
    };

    // Для personnel tab: якщо operationType === 'personnel', встановлюємо personnel
    if (activeTab === "personnel" && operationType === "personnel") {
      const totalAmount = currentEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      );
      dayData.personnel = totalAmount;
      dayData.entries = []; // Очищаємо entries, бо personnel - це витрати
    }

    if (activeTab === "operational") {
      dayData.withdrawals = currentWithdrawals;
    }

    onSave(dayData);
  }, [
    activeTab,
    newDate,
    currentEntries,
    currentWithdrawals,
    onSave,
    operationType,
    newAmount,
    doctorName,
  ]);

  const handleClose = useCallback(() => {
    // Скидаємо стан
    setNewDate(getTodayString());
    setNewPersonName("");
    setNewAmount("");
    setCurrentEntries([]);
    setCurrentWithdrawals([]);
    setModalTab("deposits");
    onClose();
  }, [onClose]);

  // Синхронізуємо стан з editingDay та selectedDate
  React.useEffect(() => {
    if (editingDay) {
      setNewDate(editingDay.dateString || getTodayString());
      setCurrentEntries(editingDay.entries || []);
      setCurrentWithdrawals(editingDay.withdrawals || []);
    } else {
      setNewDate(selectedDate || getTodayString());
      setCurrentEntries([]);
      setCurrentWithdrawals([]);
    }
  }, [editingDay, isOpen, selectedDate]);

  // Спрощений режим для income
  const isSimpleIncomeMode =
    operationType === "income" && activeTab === "personnel" && !editingDay;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={editingDay ? "Редагувати день" : "Додати новий день"}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>
          {editingDay
            ? "Редагувати день"
            : operationType === "personnel"
              ? "Додати суму персоналу"
              : "Додати до загального"}
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
        {isSimpleIncomeMode ? (
          /* Спрощений інтерфейс для "Додати загальне" */
          <>
            {doctorName && (
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ color: "#6b7280", fontWeight: "500" }}>
                  Лікар
                </label>
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

            <FormInput
              label="Дата"
              id="date-input"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mb-lg"
            />

            <FormInput
              label="Сума"
              id="amount-input"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0"
              className="mb-lg"
            />

            <div className="quick-amounts mb-lg">
              {[250, 500, 750, 1000].map((amount) => (
                <StyledButton
                  key={amount}
                  variant="outlined"
                  size="small"
                  onClick={() => setNewAmount(amount.toString())}
                >
                  {amount}
                </StyledButton>
              ))}
            </div>

            <div className="modal-actions">
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
                startIcon={<AddCircleIcon />}
                onClick={handleSave}
                disabled={!newAmount.trim()}
              >
                Додати
              </StyledButton>
            </div>
          </>
        ) : (
          /* Звичайний інтерфейс */
          <>
            <FormInput
              label="Дата"
              id="date-input"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mb-xl"
            />

            {/* Таби для операційної */}
            {activeTab === "operational" && (
              <div className="modal-tabs">
                <button
                  className={`modal-tab ${modalTab === "deposits" ? "active" : ""}`}
                  onClick={() => setModalTab("deposits")}
                >
                  <AddCircleIcon
                    style={{ fontSize: "1em", marginRight: "6px" }}
                  />
                  Додали
                </button>
                <button
                  className={`modal-tab ${modalTab === "withdrawals" ? "active" : ""}`}
                  onClick={() => setModalTab("withdrawals")}
                >
                  <RemoveCircleIcon
                    style={{ fontSize: "1em", marginRight: "6px" }}
                  />
                  Зняли
                </button>
              </div>
            )}

            {/* Summary панель */}
            {(currentEntries.length > 0 || currentWithdrawals.length > 0) && (
              <ModalSummary
                totalDeposits={totalDeposits}
                totalWithdrawals={totalWithdrawals}
                balance={modalBalance}
              />
            )}

            {/* Форма вводу */}
            <EntryForm
              personName={newPersonName}
              amount={newAmount}
              onPersonNameChange={(e) => setNewPersonName(e.target.value)}
              onAmountChange={(e) => setNewAmount(e.target.value)}
              onAddEntry={handleAddEntry}
              quickAmounts={[100, 200, 500, 1000]}
              entryType={modalTab}
            />

            {/* Список поклали */}
            {currentEntries.length > 0 && (
              <div className="entries-section">
                <h4 className="entries-section-title success">
                  <AddCircleIcon />
                  Поклали:
                </h4>
                <EntryList
                  entries={currentEntries}
                  onDeleteEntry={handleRemoveEntry}
                  emptyMessage="Немає записів"
                />
              </div>
            )}

            {/* Список зняли */}
            {activeTab === "operational" && currentWithdrawals.length > 0 && (
              <div className="entries-section">
                <h4 className="entries-section-title danger">
                  <RemoveCircleIcon />
                  Зняли:
                </h4>
                <EntryList
                  entries={currentWithdrawals}
                  onDeleteEntry={handleRemoveWithdrawal}
                  emptyMessage="Немає записів"
                />
              </div>
            )}

            {/* Кнопки дій */}
            <div className="modal-actions">
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
                {editingDay ? "Оновити день" : "Зберегти день"}
              </StyledButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AddDayModal;
