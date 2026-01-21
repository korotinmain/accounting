import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import { db } from "./firebase";
import Swal from "sweetalert2";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, SWAL_CONFIG, MESSAGES } from "./constants";
import {
  validateNumber,
  validateRequired,
  sanitizeNumber,
} from "./utils/validation";

function App() {
  // State management
  const [initialBalance, setInitialBalance] = useState(0);
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

  // Завантаження даних
  const loadData = useCallback(async () => {
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
      setLoading(true);
      setError(null);

      // Завантажити початковий баланс
      try {
        const balanceSnapshot = await getDocs(
          collection(db, COLLECTIONS.SETTINGS),
        );
        if (!balanceSnapshot.empty) {
          const balanceDoc = balanceSnapshot.docs[0];
          const balance = balanceDoc.data().initialBalance || 0;
          setInitialBalance(sanitizeNumber(balance));
        }
      } catch (balanceError) {
        console.warn(
          "Баланс не знайдено, використовуємо 0:",
          balanceError.message,
        );
      }

      // Завантажити дні
      try {
        const daysSnapshot = await getDocs(collection(db, COLLECTIONS.DAYS));
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

        // Сортуємо на клієнті
        daysData.sort((a, b) => b.date - a.date);
        setDays(daysData);
      } catch (daysError) {
        console.warn("Дні не знайдено:", daysError.message);
        setDays([]);
      }

      setLoading(false);
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      if (balanceSnapshot.empty) {
        await addDoc(collection(db, COLLECTIONS.SETTINGS), {
          initialBalance: newBalance,
          updatedAt: Timestamp.now(),
        });
      } else {
        const balanceDoc = balanceSnapshot.docs[0];
        await updateDoc(doc(db, COLLECTIONS.SETTINGS, balanceDoc.id), {
          initialBalance: newBalance,
          updatedAt: Timestamp.now(),
        });
      }

      setInitialBalance(newBalance);
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
  }, [balanceInput]);

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

    const personnel = sanitizeNumber(newPersonnel || 0);

    try {
      const dateObj = new Date(newDate);
      await addDoc(collection(db, COLLECTIONS.DAYS), {
        date: Timestamp.fromDate(dateObj),
        entries: currentEntries,
        personnel: personnel,
        createdAt: Timestamp.now(),
      });

      // Очистити форму
      setNewDate("");
      setNewPersonnel("");
      setCurrentEntries([]);

      // Перезавантажити дані
      await loadData();

      Swal.fire({
        icon: "success",
        title: "Успіх!",
        text: MESSAGES.SUCCESS.DAY_SAVED,
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
  }, [newDate, currentEntries, newPersonnel, loadData]);

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
          await loadData();

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

  // Обчислення балансу
  const currentBalance = useMemo(() => {
    let balance = initialBalance;
    days.forEach((day) => {
      const dayTotal = day.entries.reduce(
        (sum, entry) => sum + (entry.amount || 0),
        0,
      );
      balance += dayTotal - (day.personnel || 0);
    });
    return balance;
  }, [initialBalance, days]);

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
        <div className="loading">Завантаження</div>
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
      <h1>💰 Облік Фінансів</h1>

      {/* Секція балансу */}
      <div className="balance-section">
        <h2>Початковий баланс</h2>
        {!editingBalance ? (
          <>
            <div className="balance-value">
              {formatCurrency(initialBalance)} грн
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingBalance(true);
                setBalanceInput(initialBalance.toString());
              }}
              aria-label="Редагувати початковий баланс"
            >
              Редагувати
            </button>
          </>
        ) : (
          <div className="balance-edit">
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              placeholder="Введіть баланс"
              aria-label="Початковий баланс"
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleSaveBalance}>
              Зберегти
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingBalance(false);
                setBalanceInput("");
              }}
            >
              Скасувати
            </button>
          </div>
        )}

        <h2 style={{ marginTop: "30px" }}>Поточний залишок</h2>
        <div className="balance-value">
          {formatCurrency(currentBalance)} грн
        </div>
      </div>

      {/* Секція додавання нового дня */}
      <div className="add-entry-section">
        <h3>➕ Додати новий день</h3>

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

        <h4 style={{ marginBottom: "15px", color: "#555" }}>
          📝 Записи (ПІБ + сума)
        </h4>
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
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
              aria-label="Сума"
              step="0.01"
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

            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                background: "#fff3cd",
                borderRadius: "10px",
                border: "2px solid #ffc107",
              }}
            >
              <h4 style={{ marginBottom: "10px", color: "#856404" }}>
                💼 Витрати на персонал за день
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
                type="number"
                value={newPersonnel}
                onChange={(e) => setNewPersonnel(e.target.value)}
                placeholder="0.00"
                aria-label="Витрати на персонал"
                step="0.01"
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

            <button
              className="btn btn-primary"
              onClick={handleSaveDay}
              style={{ marginTop: "15px", width: "100%" }}
            >
              💾 Зберегти день
            </button>
          </div>
        )}
      </div>

      {/* Список днів */}
      <div className="days-section">
        <h3>📅 Записи по днях</h3>
        {days.length === 0 ? (
          <div className="empty-state">
            <p>Поки немає жодних записів. Додайте перший день!</p>
          </div>
        ) : (
          days.map((day) => {
            const dayTotal = day.entries.reduce(
              (sum, entry) => sum + (entry.amount || 0),
              0,
            );
            return (
              <div key={day.id} className="day-card">
                <div className="day-header">
                  <div className="day-date">{formatDate(day.date)}</div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteDay(day.id)}
                    aria-label={`Видалити день ${formatDate(day.date)}`}
                  >
                    Видалити
                  </button>
                </div>

                {day.entries.map((entry, index) => (
                  <div key={`${day.id}-${index}`} className="entry-item">
                    <div className="entry-info">
                      <div className="entry-name">{entry.name}</div>
                      <div className="entry-amount">
                        +{formatCurrency(entry.amount)} грн
                      </div>
                    </div>
                  </div>
                ))}

                {day.personnel > 0 && (
                  <div className="personnel-section">
                    <div className="personnel-label">Персонал (витрати):</div>
                    <div className="personnel-value">
                      -{formatCurrency(day.personnel)} грн
                    </div>
                  </div>
                )}

                <div
                  className="day-header"
                  style={{
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "2px solid #f0f0f0",
                  }}
                >
                  <div style={{ fontWeight: "600" }}>Підсумок дня:</div>
                  <div className="day-total">
                    {formatCurrency(dayTotal - day.personnel)} грн
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
