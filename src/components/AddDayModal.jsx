import React, { useState, useCallback, useMemo } from "react";
import Modal from "react-modal";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
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

// Список співробітників
const EMPLOYEES = [
  "Заброварна Т.М.",
  "Герега С.Р.",
  "Гудловська М.А.",
  "Кожемяченко В.С.",
  "Коротіна Х.В.",
  "Левків В.А.",
  "Линда Б.Л.",
  "Раба Б.М.",
  "Семенюк О.О.",
  "Чорній Д.І.",
];

/**
 * Модальне вікно для додавання/редагування дня
 * @param {boolean} isOpen - Чи відкрите модальне вікно
 * @param {function} onClose - Callback для закриття
 * @param {function} onSave - Callback для збереження
 * @param {Object} editingDay - День для редагування (якщо є)
 * @param {string} activeTab - Активна вкладка ('personnel' або 'operational')
 */
const AddDayModal = ({ isOpen, onClose, onSave, editingDay, activeTab }) => {
  const [newDate, setNewDate] = useState(
    editingDay?.dateString || getTodayString(),
  );
  const [newPersonName, setNewPersonName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPersonnel, setNewPersonnel] = useState(
    editingDay?.personnel?.toString() || "",
  );
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

  const handleSave = useCallback(() => {
    // Валідація
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
      personnel:
        activeTab === "personnel" ? sanitizeNumber(newPersonnel || "0") : 0,
    };

    if (activeTab === "operational") {
      dayData.withdrawals = currentWithdrawals;
    }

    onSave(dayData);
  }, [
    activeTab,
    newDate,
    currentEntries,
    currentWithdrawals,
    newPersonnel,
    onSave,
  ]);

  const handleClose = useCallback(() => {
    // Скидаємо стан
    setNewDate(getTodayString());
    setNewPersonName("");
    setNewAmount("");
    setNewPersonnel("");
    setCurrentEntries([]);
    setCurrentWithdrawals([]);
    setModalTab("deposits");
    onClose();
  }, [onClose]);

  // Синхронізуємо стан з editingDay
  React.useEffect(() => {
    if (editingDay) {
      setNewDate(editingDay.dateString || getTodayString());
      setCurrentEntries(editingDay.entries || []);
      setCurrentWithdrawals(editingDay.withdrawals || []);
      setNewPersonnel(editingDay.personnel?.toString() || "");
    } else {
      setNewDate(getTodayString());
      setCurrentEntries([]);
      setCurrentWithdrawals([]);
      setNewPersonnel("");
    }
  }, [editingDay, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={editingDay ? "Редагувати день" : "Додати новий день"}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>{editingDay ? "Редагувати день" : "Додати новий день"}</h3>
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Закрити"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="modal-body">
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
              <AddCircleIcon style={{ fontSize: "1em", marginRight: "6px" }} />
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
              {activeTab === "operational" && currentWithdrawals.length > 0 && (
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
            {activeTab === "operational" && currentWithdrawals.length > 0 && (
              <div className="summary-balance">
                <span>Баланс:</span>
                <span className={modalBalance >= 0 ? "positive" : "negative"}>
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
            <select
              id="person-name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              aria-label="ПІБ особи"
            >
              <option value="">Оберіть співробітника</option>
              {EMPLOYEES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
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
              <AddCircleIcon style={{ fontSize: "1em", marginRight: "6px" }} />
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
                  <div className="entry-amount" style={{ color: "#ef4444" }}>
                    -{formatCurrency(entry.amount)} грн
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    setCurrentWithdrawals((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  aria-label={`Видалити запис ${entry.name}`}
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Персонал (тільки для personnel) */}
        {activeTab === "personnel" && currentEntries.length > 0 && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              background: "#fff3cd",
              borderRadius: "10px",
              border: "2px solid #ffc107",
            }}
          >
            <h4
              style={{
                marginBottom: "10px",
                color: "#856404",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <WorkIcon style={{ fontSize: "1.1em" }} />
              Витрати на персонал за день
            </h4>
            <p
              style={{
                marginBottom: "10px",
                fontSize: "0.9em",
                color: "#856404",
              }}
            >
              Загальна сума витрат на персонал для цього дня
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newPersonnel}
              onChange={(e) => setNewPersonnel(e.target.value)}
              placeholder="0"
              aria-label="Витрати на персонал"
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #ffc107",
                borderRadius: "8px",
                fontSize: "1.1em",
                marginBottom: "15px",
              }}
            />
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
      </div>
    </Modal>
  );
};

export default AddDayModal;
