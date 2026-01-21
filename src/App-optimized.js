import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import { db } from "./firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
import SaveIcon from "@mui/icons-material/Save";
import EventIcon from "@mui/icons-material/Event";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EditNoteIcon from "@mui/icons-material/EditNote";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { COLLECTIONS, SWAL_CONFIG, MESSAGES } from "./constants";
import {
  validateNumber,
  validateRequired,
  sanitizeNumber,
} from "./utils/validation";

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

// Встановлюю root для accessibility
Modal.setAppElement("#root");

function App() {
  // State management
  const [activeTab, setActiveTab] = useState("personnel"); // 'personnel' or 'operational'
  const [initialBalancePersonnel, setInitialBalancePersonnel] = useState(0);
  const [initialBalanceOperational, setInitialBalanceOperational] = useState(0);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  const [newDate, setNewDate] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPersonnel, setNewPersonnel] = useState("");
  const [currentEntries, setCurrentEntries] = useState([]);

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDayId, setEditingDayId] = useState(null);

  // Computed values based on active tab
  const initialBalance =
    activeTab === "personnel"
      ? initialBalancePersonnel
      : initialBalanceOperational;

  // Завантаження даних
  const loadData = useCallback(
    async (silent = false) => {
      if (!db) {
        const errorMsg = MESSAGES.ERRORS.FIREBASE_NOT_INITIALIZED;
        console.error(errorMsg);
        setError(errorMsg);
        Swal.fire({
          icon: "error",
          title: "Помилка підключення",
          text: errorMsg,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
        setLoading(false);
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }
        setError(null);

        // Завантажити початкові баланси (обидва)
        try {
          const balanceSnapshot = await getDocs(
            collection(db, COLLECTIONS.SETTINGS),
          );
          if (!balanceSnapshot.empty) {
            balanceSnapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();
              if (data.type === "personnel") {
                setInitialBalancePersonnel(
                  sanitizeNumber(data.initialBalance || 0),
                );
              } else if (data.type === "operational") {
                setInitialBalanceOperational(
                  sanitizeNumber(data.initialBalance || 0),
                );
              }
            });
          }
        } catch (balanceError) {
          console.warn(
            "Баланс не знайдено, використовуємо 0:",
            balanceError.message,
          );
        }

        // Завантажити дні для поточного табу
        try {
          const daysQuery = query(
            collection(db, COLLECTIONS.DAYS),
            where("type", "==", activeTab),
          );
          const daysSnapshot = await getDocs(daysQuery);
          const daysData = daysSnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              date: data.date?.toDate ? data.date.toDate() : new Date(),
              entries: data.entries || [],
              personnel: sanitizeNumber(data.personnel || 0),
            };
          });

          // Сортуємо за датою: найновіші зверху
          daysData.sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });

          setDays(daysData);
        } catch (daysError) {
          console.warn("Дні не знайдено:", daysError.message);
          setDays([]);
        }

        if (!silent) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Критична помилка завантаження даних:", error);
        setError(error.message);
        Swal.fire({
          icon: "error",
          title: "Помилка завантаження",
          html: `
          <p>Помилка підключення до бази даних: <strong>${error.message}</strong></p>
          <br>
          <p style="text-align: left;">Переконайтесь що:</p>
          <ol style="text-align: left;">
            <li>Firestore активовано в Firebase Console</li>
            <li>Правила безпеки дозволяють читання/запис</li>
            <li>Конфігурація Firebase правильна</li>
          </ol>
        `,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
          width: "600px",
        });
        setLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Перезавантажуємо дані при зміні табу
  useEffect(() => {
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Обробники подій
  const handleSaveBalance = useCallback(async () => {
    if (!validateNumber(balanceInput)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректне значення",
        text: MESSAGES.ERRORS.INVALID_NUMBER,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    const newBalance = sanitizeNumber(balanceInput);

    try {
      const balanceSnapshot = await getDocs(
        collection(db, COLLECTIONS.SETTINGS),
      );

      // Шукаємо документ для поточного типу
      const existingDoc = balanceSnapshot.docs.find(
        (doc) => doc.data().type === activeTab,
      );

      if (!existingDoc) {
        // Створюємо новий документ
        await addDoc(collection(db, COLLECTIONS.SETTINGS), {
          type: activeTab,
          initialBalance: newBalance,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Оновлюємо існуючий
        await updateDoc(doc(db, COLLECTIONS.SETTINGS, existingDoc.id), {
          initialBalance: newBalance,
          updatedAt: Timestamp.now(),
        });
      }

      if (activeTab === "personnel") {
        setInitialBalancePersonnel(newBalance);
      } else {
        setInitialBalanceOperational(newBalance);
      }

      setEditingBalance(false);
      setBalanceInput("");

      Swal.fire({
        icon: "success",
        title: "Збережено!",
        text: MESSAGES.SUCCESS.BALANCE_SAVED,
        timer: SWAL_CONFIG.timer,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Помилка збереження балансу:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: MESSAGES.ERRORS.SAVE_BALANCE_ERROR,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
    }
  }, [balanceInput, activeTab]);

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

    setCurrentEntries((prev) => [
      ...prev,
      {
        name: newPersonName.trim(),
        amount: amount,
      },
    ]);
    setNewPersonName("");
    setNewAmount("");
  }, [newPersonName, newAmount]);

  const handleRemoveEntry = useCallback((index) => {
    setCurrentEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveDay = useCallback(async () => {
    if (!validateRequired(newDate)) {
      Swal.fire({
        icon: "warning",
        title: "Виберіть дату",
        text: MESSAGES.ERRORS.NO_DATE,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    if (currentEntries.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Немає записів",
        text: MESSAGES.ERRORS.NO_ENTRIES,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
      return;
    }

    const personnel =
      activeTab === "personnel" ? sanitizeNumber(newPersonnel || 0) : 0;

    try {
      const dateObj = new Date(newDate);

      if (editingDayId) {
        // Режим редагування - оновлюємо існуючий запис
        await updateDoc(doc(db, COLLECTIONS.DAYS, editingDayId), {
          date: Timestamp.fromDate(dateObj),
          entries: currentEntries,
          personnel: personnel,
          type: activeTab,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Режим додавання - створюємо новий запис
        await addDoc(collection(db, COLLECTIONS.DAYS), {
          date: Timestamp.fromDate(dateObj),
          entries: currentEntries,
          personnel: personnel,
          type: activeTab,
          createdAt: Timestamp.now(),
        });
      }

      // Очистити форму
      setNewDate("");
      setNewPersonnel("");
      setCurrentEntries([]);
      setEditingDayId(null);
      setShowModal(false);

      // Перезавантажити дані (без показу екрана завантаження)
      await loadData(true);

      Swal.fire({
        icon: "success",
        title: "Успіх!",
        text: editingDayId ? "День оновлено!" : MESSAGES.SUCCESS.DAY_SAVED,
        timer: SWAL_CONFIG.timer,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Помилка збереження дня:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: MESSAGES.ERRORS.SAVE_DAY_ERROR,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      });
    }
  }, [
    newDate,
    currentEntries,
    newPersonnel,
    editingDayId,
    loadData,
    activeTab,
  ]);

  const handleOpenModal = useCallback((day = null) => {
    if (day) {
      // Режим редагування
      setEditingDayId(day.id);
      try {
        const date = day.date instanceof Date ? day.date : new Date(day.date);
        if (!isNaN(date.getTime())) {
          setNewDate(date.toISOString().split("T")[0]);
        } else {
          setNewDate("");
        }
      } catch (error) {
        console.error("Помилка конвертації дати:", error);
        setNewDate("");
      }
      setCurrentEntries(day.entries || []);
      setNewPersonnel(day.personnel?.toString() || "");
    } else {
      // Режим додавання
      setEditingDayId(null);
      setNewDate("");
      setCurrentEntries([]);
      setNewPersonnel("");
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    // Очистити форму при закритті
    setNewDate("");
    setNewPersonName("");
    setNewAmount("");
    setNewPersonnel("");
    setCurrentEntries([]);
    setEditingDayId(null);
  }, []);

  const handleDeleteDay = useCallback(
    async (dayId) => {
      const result = await Swal.fire({
        title: "Ви впевнені?",
        text: MESSAGES.CONFIRM.DELETE_DAY,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: SWAL_CONFIG.confirmButtonColor,
        confirmButtonText: "Так, видалити",
        cancelButtonText: "Скасувати",
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, COLLECTIONS.DAYS, dayId));
          await loadData(true);

          Swal.fire({
            icon: "success",
            title: "Видалено!",
            text: MESSAGES.SUCCESS.DAY_DELETED,
            timer: SWAL_CONFIG.timer,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Помилка видалення дня:", error);
          Swal.fire({
            icon: "error",
            title: "Помилка",
            text: MESSAGES.ERRORS.DELETE_DAY_ERROR,
            confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
          });
        }
      }
    },
    [loadData],
  );

  // Відсортовані дні (найсвіжіші зверху)
  const sortedDays = useMemo(() => {
    return [...days].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [days]);

  // Обчислення балансу
  const currentBalance = useMemo(() => {
    let balance = initialBalance;
    sortedDays.forEach((day) => {
      const dayTotal = day.entries.reduce(
        (sum, entry) => sum + (entry.amount || 0),
        0,
      );
      // Для операційної персонал не віднімаємо
      if (activeTab === "personnel") {
        balance += dayTotal - (day.personnel || 0);
      } else {
        balance += dayTotal;
      }
    });
    return balance;
  }, [initialBalance, sortedDays, activeTab]);

  // Форматування
  const formatDate = useCallback((date) => {
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Рендер
  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="header-icon skeleton-icon"></div>
            <div className="header-text">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-subtitle"></div>
            </div>
          </div>
        </header>

        <div className="tabs-container">
          <div className="skeleton skeleton-tab"></div>
          <div className="skeleton skeleton-tab"></div>
        </div>

        <div className="balance-cards">
          <div className="balance-card">
            <div className="balance-card-header">
              <div className="skeleton skeleton-icon-small"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
            <div className="skeleton skeleton-amount"></div>
          </div>
          <div className="balance-card">
            <div className="balance-card-header">
              <div className="skeleton skeleton-icon-small"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
            <div className="skeleton skeleton-amount"></div>
            <div className="skeleton skeleton-trend"></div>
          </div>
        </div>

        <div className="skeleton skeleton-button"></div>

        <div className="days-section">
          <div className="skeleton skeleton-heading"></div>
          <div className="days-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="day-card-compact skeleton-card">
                <div className="skeleton skeleton-card-header"></div>
                <div className="skeleton skeleton-card-body"></div>
                <div className="skeleton skeleton-card-footer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && days.length === 0) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h2>😔 Не вдалося завантажити дані</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">
            <AccountBalanceWalletIcon />
          </div>
          <div className="header-text">
            <h1>Облік Фінансів</h1>
            <p className="header-subtitle">Управління вашими фінансами</p>
          </div>
        </div>
      </header>

      {/* Перемикач табів */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "personnel" ? "active" : ""}`}
          onClick={() => setActiveTab("personnel")}
        >
          <GroupsIcon style={{ fontSize: "1.2em", marginRight: "8px" }} />
          <span>Персонал</span>
        </button>
        <button
          className={`tab-button ${activeTab === "operational" ? "active" : ""}`}
          onClick={() => setActiveTab("operational")}
        >
          <BusinessCenterIcon
            style={{ fontSize: "1.2em", marginRight: "8px" }}
          />
          <span>Операційна</span>
        </button>
      </div>

      {/* Секція балансу */}
      <div className="balance-cards">
        <div className="balance-card initial-balance">
          <div className="balance-card-header">
            <div className="balance-card-icon">
              <AccountBalanceIcon />
            </div>
            <span className="balance-card-title">Початковий баланс</span>
            {!editingBalance && (
              <button
                className="btn-edit-balance"
                onClick={() => {
                  setEditingBalance(true);
                  setBalanceInput(initialBalance.toString());
                }}
                aria-label="Редагувати початковий баланс"
                title="Редагувати"
              >
                <EditIcon style={{ fontSize: "1em" }} />
              </button>
            )}
          </div>

          {!editingBalance ? (
            <div className="balance-card-amount">
              {formatCurrency(initialBalance)}
              <span className="balance-currency">грн</span>
            </div>
          ) : (
            <div className="balance-edit-inline">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="Введіть баланс"
                aria-label="Початковий баланс"
                autoFocus
              />
              <div className="balance-edit-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveBalance}
                >
                  <SaveIcon style={{ fontSize: "1em" }} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setEditingBalance(false);
                    setBalanceInput("");
                  }}
                >
                  <CloseIcon style={{ fontSize: "1em" }} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="balance-card current-balance">
          <div className="balance-card-header">
            <div className="balance-card-icon current">
              <TrendingUpIcon />
            </div>
            <span className="balance-card-title">Поточний залишок</span>
          </div>
          <div className="balance-card-amount">
            {formatCurrency(currentBalance)}
            <span className="balance-currency">грн</span>
          </div>
          <div className="balance-card-trend">
            {currentBalance >= initialBalance ? (
              <span className="trend-positive">
                ↑ {formatCurrency(currentBalance - initialBalance)}
              </span>
            ) : (
              <span className="trend-negative">
                ↓ {formatCurrency(initialBalance - currentBalance)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Кнопка для відкриття модалу */}
      <button className="add-day-button" onClick={handleOpenModal}>
        <AddCircleIcon style={{ fontSize: "1.2em", marginRight: "6px" }} />
        Додати новий день
      </button>

      {/* Модальне вікно */}
      <Modal
        isOpen={showModal}
        onRequestClose={handleCloseModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        closeTimeoutMS={300}
      >
        <div className="modal-header">
          <h3>
            <AddCircleIcon
              style={{
                fontSize: "1em",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            />
            Додати новий день
          </h3>
          <button
            className="modal-close"
            onClick={handleCloseModal}
            aria-label="Закрити"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
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

          <h4
            style={{
              marginBottom: "15px",
              color: "#555",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <DescriptionIcon style={{ fontSize: "1.1em" }} />
            Записи (ПІБ + сума)
          </h4>
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
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleAddEntry}>
            Додати запис
          </button>

          {currentEntries.length > 0 && (
            <div className="entries-list">
              <h4>Додані записи:</h4>
              {currentEntries.map((entry, index) => (
                <div key={`${entry.name}-${index}`} className="entry-item">
                  <div className="entry-info">
                    <div className="entry-name">{entry.name}</div>
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

              {activeTab === "personnel" && (
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

              <button
                className="btn btn-primary"
                onClick={handleSaveDay}
                style={{
                  marginTop: "15px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <SaveIcon style={{ fontSize: "1.1em" }} />
                {editingDayId ? "Оновити день" : "Зберегти день"}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Список днів */}
      <div className="days-section">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EventIcon style={{ fontSize: "1em" }} />
          Записи по днях
        </h3>
        {sortedDays.length === 0 ? (
          <div className="empty-state">
            <p>Поки немає жодних записів. Додайте перший день!</p>
          </div>
        ) : (
          <div className="days-grid">
            {sortedDays.map((day) => {
              const dayTotal = day.entries.reduce(
                (sum, entry) => sum + (entry.amount || 0),
                0,
              );
              // Для операційної не віднімаємо персонал
              const finalTotal =
                activeTab === "personnel"
                  ? dayTotal - (day.personnel || 0)
                  : dayTotal;
              return (
                <div key={day.id} className="day-card-compact">
                  <div className="day-card-header">
                    <div className="day-date-compact">
                      <EventIcon style={{ fontSize: "1.1em" }} />
                      {formatDate(day.date)}
                    </div>
                    <div className="day-card-actions">
                      <button
                        className="btn-edit-compact"
                        onClick={() => handleOpenModal(day)}
                        aria-label={`Редагувати день ${formatDate(day.date)}`}
                        title="Редагувати"
                      >
                        <EditNoteIcon style={{ fontSize: "1.1em" }} />
                      </button>
                      <button
                        className="btn-delete-compact"
                        onClick={() => handleDeleteDay(day.id)}
                        aria-label={`Видалити день ${formatDate(day.date)}`}
                        title="Видалити"
                      >
                        <DeleteOutlineIcon style={{ fontSize: "1.1em" }} />
                      </button>
                    </div>
                  </div>

                  <div className="day-card-body">
                    <div className="entries-compact">
                      {day.entries.map((entry, index) => (
                        <div key={`${day.id}-${index}`} className="entry-row">
                          <span className="entry-name-compact">
                            {entry.name}
                          </span>
                          <span className="entry-amount-compact positive">
                            +{formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {activeTab === "personnel" && day.personnel > 0 && (
                      <div className="personnel-row">
                        <span
                          className="personnel-label-compact"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <WorkIcon style={{ fontSize: "1em" }} />
                          Персонал
                        </span>
                        <span className="personnel-amount-compact">
                          -{formatCurrency(day.personnel)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="day-card-footer">
                    <span className="footer-label">Підсумок:</span>
                    <span
                      className={`footer-total ${finalTotal >= 0 ? "positive" : "negative"}`}
                    >
                      {finalTotal >= 0 ? "+" : ""}
                      {formatCurrency(finalTotal)} грн
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
