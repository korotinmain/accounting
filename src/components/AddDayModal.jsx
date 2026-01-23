import React, { useState, useCallback, useMemo } from "react";
import Modal from "react-modal";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import Swal from "sweetalert2";
import { SWAL_CONFIG, MESSAGES } from "../constants";
import {
  validateRequired,
  validateNumber,
  sanitizeNumber,
} from "../utils/validation";
import { formatCurrency } from "../utils/formatters";
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
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Закрити"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="modal-body">
        {isSimpleIncomeMode ? (
          /* Спрощений інтерфейс для "Додати загальне" */
          <>
            {/* ПІБ як інформація */}
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

            {/* Дата */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label htmlFor="date-input">Дата</label>
              <input
                id="date-input"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                aria-label="Дата"
              />
            </div>

            {/* Сума */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label htmlFor="amount-input">Сума</label>
              <input
                id="amount-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0"
                aria-label="Сума"
                style={{ fontSize: "1.1em" }}
              />
              <div className="quick-amounts" style={{ marginTop: "12px" }}>
                {[250, 500, 750, 1000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className="quick-amount-btn"
                    onClick={() => setNewAmount(amount.toString())}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопки дій */}
            <div className="modal-actions" style={{ marginTop: "30px" }}>
              <button
                className="btn btn-secondary btn-cancel"
                onClick={handleClose}
              >
                <CloseIcon style={{ fontSize: "1.1em" }} />
                Скасувати
              </button>
              <button
                className="btn btn-primary btn-save"
                onClick={handleSave}
                disabled={!newAmount.trim()}
              >
                <AddCircleIcon style={{ fontSize: "1.1em" }} />
                Додати
              </button>
            </div>
          </>
        ) : (
          /* Звичайний інтерфейс для інших режимів */
          <>
            {/* Дата */}
            <div className="form-group" style={{ marginBottom: "25px" }}>
              <label htmlFor="date-input">Дата</label>
              <input
                id="date-input"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                aria-label="Дата"
              />
            </div>

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
              <div className="modal-summary">
                <div className="summary-stats">
                  {currentEntries.length > 0 && (
                    <div className="summary-item deposits">
                      <div className="summary-label">
                        <AddCircleIcon style={{ fontSize: "0.9em" }} />
                        Поклали
                      </div>
                      <div className="summary-value">
                        +{formatCurrency(totalDeposits)} грн
                      </div>
                      <div className="summary-count">
                        {currentEntries.length} записів
                      </div>
                    </div>
                  )}
                  {activeTab === "operational" &&
                    currentWithdrawals.length > 0 && (
                      <div className="summary-item withdrawals">
                        <div className="summary-label">
                          <RemoveCircleIcon style={{ fontSize: "0.9em" }} />
                          Зняли
                        </div>
                        <div className="summary-value">
                          -{formatCurrency(totalWithdrawals)} грн
                        </div>
                        <div className="summary-count">
                          {currentWithdrawals.length} записів
                        </div>
                      </div>
                    )}
                </div>
                {activeTab === "operational" &&
                  currentWithdrawals.length > 0 && (
                    <div className="summary-balance">
                      <span>Баланс:</span>
                      <span
                        className={modalBalance >= 0 ? "positive" : "negative"}
                      >
                        {modalBalance >= 0 ? "+" : ""}
                        {formatCurrency(modalBalance)} грн
                      </span>
                    </div>
                  )}
              </div>
            )}

            {/* Заголовок форми */}
            <h4
              style={{
                marginBottom: "15px",
                color:
                  activeTab === "operational" && modalTab === "withdrawals"
                    ? "#ef4444"
                    : "#10b981",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {activeTab === "operational" ? (
                modalTab === "withdrawals" ? (
                  <>
                    <RemoveCircleIcon style={{ fontSize: "1.1em" }} />
                    Зняли кошти
                  </>
                ) : (
                  <>
                    <AddCircleIcon style={{ fontSize: "1.1em" }} />
                    Додали кошти
                  </>
                )
              ) : (
                <>
                  <DescriptionIcon style={{ fontSize: "1.1em" }} />
                  Записи (ПІБ + сума)
                </>
              )}
            </h4>

            {/* Форма вводу */}
            <div className="entry-form">
              <div className="form-group">
                <label htmlFor="person-name">ПІБ</label>
                <input
                  id="person-name"
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Введіть ПІБ"
                  aria-label="ПІБ особи"
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount-input">Сума</label>
                <input
                  id="amount-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                  aria-label="Сума"
                />
                <div className="quick-amounts">
                  {[100, 200, 500, 1000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="quick-amount-btn"
                      onClick={() => setNewAmount(amount.toString())}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Кнопка додавання */}
            <button
              className={
                activeTab === "operational" && modalTab === "withdrawals"
                  ? "btn btn-danger"
                  : "btn btn-primary"
              }
              onClick={handleAddEntry}
              disabled={!newPersonName.trim() || !newAmount.trim()}
            >
              {activeTab === "operational" && modalTab === "withdrawals" ? (
                <>
                  <RemoveCircleIcon
                    style={{ fontSize: "1em", marginRight: "6px" }}
                  />
                  Додати зняття
                </>
              ) : (
                <>
                  <AddCircleIcon
                    style={{ fontSize: "1em", marginRight: "6px" }}
                  />
                  Додати запис
                </>
              )}
            </button>

            {/* Список поклали */}
            {currentEntries.length > 0 && (
              <div className="entries-list">
                <h4
                  style={{
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AddCircleIcon style={{ fontSize: "1em" }} />
                  Поклали:
                </h4>
                {currentEntries.map((entry, index) => (
                  <div key={`${entry.name}-${index}`} className="entry-item">
                    <div className="entry-info">
                      <div className="entry-name">
                        <PersonIcon
                          style={{ fontSize: "1em", marginRight: "6px" }}
                        />
                        {entry.name}
                      </div>
                      <div className="entry-amount">
                        {formatCurrency(entry.amount)} грн
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveEntry(index)}
                      aria-label={`Видалити запис ${entry.name}`}
                    >
                      Видалити
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Список зняли */}
            {activeTab === "operational" && currentWithdrawals.length > 0 && (
              <div className="entries-list withdrawals-list">
                <h4
                  style={{
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RemoveCircleIcon style={{ fontSize: "1em" }} />
                  Зняли:
                </h4>
                {currentWithdrawals.map((entry, index) => (
                  <div
                    key={`withdrawal-${entry.name}-${index}`}
                    className="entry-item"
                  >
                    <div className="entry-info">
                      <div className="entry-name">
                        <PersonIcon
                          style={{ fontSize: "1em", marginRight: "6px" }}
                        />
                        {entry.name}
                      </div>
                      <div
                        className="entry-amount"
                        style={{ color: "#ef4444" }}
                      >
                        -{formatCurrency(entry.amount)} грн
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveWithdrawal(index)}
                      aria-label={`Видалити запис ${entry.name}`}
                    >
                      Видалити
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Кнопки дій */}
            <div className="modal-actions">
              <button
                className="btn btn-secondary btn-cancel"
                onClick={handleClose}
              >
                <CloseIcon style={{ fontSize: "1.1em" }} />
                Скасувати
              </button>
              <button className="btn btn-primary btn-save" onClick={handleSave}>
                <SaveIcon style={{ fontSize: "1.1em" }} />
                {editingDay ? "Оновити день" : "Зберегти день"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AddDayModal;
