import React, { useState, useEffect } from "react";
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

function App() {
  const [initialBalance, setInitialBalance] = useState(0);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  // Для додавання нового дня
  const [newDate, setNewDate] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPersonnel, setNewPersonnel] = useState("");
  const [currentEntries, setCurrentEntries] = useState([]);

  // Дані з Firestore
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантаження даних при старті
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!db) {
      console.error("Firebase не ініціалізовано");
      Swal.fire({
        icon: "error",
        title: "Помилка підключення",
        text: "Помилка підключення до Firebase. Перевірте налаштування.",
        confirmButtonColor: "#6366f1",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("Завантаження даних...");

      // Завантажити початковий баланс
      try {
        const balanceSnapshot = await getDocs(collection(db, "settings"));
        if (!balanceSnapshot.empty) {
          const balanceDoc = balanceSnapshot.docs[0];
          setInitialBalance(balanceDoc.data().initialBalance || 0);
        }
        console.log("Баланс завантажено");
      } catch (balanceError) {
        console.log(
          "Баланс не знайдено, використовуємо 0:",
          balanceError.message,
        );
      }

      // Завантажити дні
      try {
        const daysSnapshot = await getDocs(collection(db, "days"));
        const daysData = daysSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(),
        }));
        // Сортуємо на клієнті
        daysData.sort((a, b) => b.date - a.date);
        setDays(daysData);
        console.log("Дні завантажено:", daysData.length);
      } catch (daysError) {
        console.log("Дні не знайдено або помилка:", daysError.message);
        setDays([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Критична помилка завантаження даних:", error);
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
        confirmButtonColor: "#6366f1",
        width: "600px",
      });
      setLoading(false);
    }
  };

  const handleSaveBalance = async () => {
    const newBalance = parseFloat(balanceInput);
    if (isNaN(newBalance)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректне значення",
        text: "Введіть коректне число",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    try {
      const balanceSnapshot = await getDocs(collection(db, "settings"));
      if (balanceSnapshot.empty) {
        await addDoc(collection(db, "settings"), {
          initialBalance: newBalance,
        });
      } else {
        const balanceDoc = balanceSnapshot.docs[0];
        await updateDoc(doc(db, "settings", balanceDoc.id), {
          initialBalance: newBalance,
        });
      }
      setInitialBalance(newBalance);
      setEditingBalance(false);
      setBalanceInput("");
      Swal.fire({
        icon: "success",
        title: "Збережено!",
        text: "Баланс успішно оновлено",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Помилка збереження балансу:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: "Помилка збереження балансу",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const handleAddEntry = () => {
    if (!newPersonName || !newAmount) {
      Swal.fire({
        icon: "warning",
        title: "Заповніть поля",
        text: "Заповніть ПІБ та суму",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount)) {
      Swal.fire({
        icon: "warning",
        title: "Некоректна сума",
        text: "Введіть коректну суму",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setCurrentEntries([
      ...currentEntries,
      {
        name: newPersonName,
        amount: amount,
      },
    ]);
    setNewPersonName("");
    setNewAmount("");
  };

  const handleRemoveEntry = (index) => {
    setCurrentEntries(currentEntries.filter((_, i) => i !== index));
  };

  const handleSaveDay = async () => {
    if (!newDate) {
      Swal.fire({
        icon: "warning",
        title: "Виберіть дату",
        text: "Будь ласка, виберіть дату для збереження",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (currentEntries.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Немає записів",
        text: "Додайте хоча б один запис перед збереженням дня",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    const personnel = parseFloat(newPersonnel) || 0;

    try {
      const dateObj = new Date(newDate);
      await addDoc(collection(db, "days"), {
        date: Timestamp.fromDate(dateObj),
        entries: currentEntries,
        personnel: personnel,
      });

      // Очистити форму
      setNewDate("");
      setNewPersonnel("");
      setCurrentEntries([]);

      // Перезавантажити дані
      loadData();
      Swal.fire({
        icon: "success",
        title: "Успіх!",
        text: "День збережено успішно!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Помилка збереження дня:", error);
      Swal.fire({
        icon: "error",
        title: "Помилка",
        text: "Помилка збереження дня",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const handleDeleteDay = async (dayId) => {
    const result = await Swal.fire({
      title: "Ви впевнені?",
      text: "Цей день буде видалено назавжди!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6366f1",
      confirmButtonText: "Так, видалити",
      cancelButtonText: "Скасувати",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "days", dayId));
        loadData();
        Swal.fire({
          icon: "success",
          title: "Видалено!",
          text: "День успішно видалено",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Помилка видалення дня:", error);
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: "Помилка видалення дня",
          confirmButtonColor: "#6366f1",
        });
      }
    }
  };

  const calculateBalance = () => {
    let balance = initialBalance;
    days.forEach((day) => {
      const dayTotal = day.entries.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      );
      balance += dayTotal - day.personnel;
    });
    return balance;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Завантаження...</div>
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
          {formatCurrency(calculateBalance())} грн
        </div>
      </div>

      {/* Секція додавання нового дня */}
      <div className="add-entry-section">
        <h3>➕ Додати новий день</h3>

        <div className="form-group" style={{ marginBottom: "25px" }}>
          <label>Дата</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>

        <h4 style={{ marginBottom: "15px", color: "#555" }}>
          📝 Записи (ПІБ + сума)
        </h4>
        <div className="entry-form">
          <div className="form-group">
            <label>ПІБ</label>
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Введіть ПІБ"
            />
          </div>
          <div className="form-group">
            <label>Сума</label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
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
              <div key={index} className="entry-item">
                <div className="entry-info">
                  <div className="entry-name">{entry.name}</div>
                  <div className="entry-amount">
                    {formatCurrency(entry.amount)} грн
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemoveEntry(index)}
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
              (sum, entry) => sum + entry.amount,
              0,
            );
            return (
              <div key={day.id} className="day-card">
                <div className="day-header">
                  <div className="day-date">{formatDate(day.date)}</div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteDay(day.id)}
                  >
                    Видалити
                  </button>
                </div>

                {day.entries.map((entry, index) => (
                  <div key={index} className="entry-item">
                    <div className="entry-info">
                      <div className="entry-name">{entry.name}</div>
                      <div className="entry-amount">
                        +{formatCurrency(entry.amount)} грн
                      </div>
                    </div>
                  </div>
                ))}

                <div className="personnel-section">
                  <div className="personnel-label">Персонал (витрати):</div>
                  <div className="personnel-value">
                    -{formatCurrency(day.personnel)} грн
                  </div>
                </div>

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
