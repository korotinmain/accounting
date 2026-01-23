import React, { useState, useCallback, useMemo } from "react";
import "./App.css";
import Modal from "react-modal";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";

// Hooks
import { useBalance } from "./hooks/useBalance";
import { useDays } from "./hooks/useDays";

// Components
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import BalanceCards from "./components/BalanceCards";
import DayCard from "./components/DayCard";
import AddDayModal from "./components/AddDayModal";
import PersonnelModal from "./components/PersonnelModal";
import LoadingState from "./components/LoadingState";
import DoctorSelection from "./components/DoctorSelection";
import EntriesTable from "./components/EntriesTable";

// Utils
import { SWAL_CONFIG, MESSAGES } from "./constants";

// Встановлюю root для accessibility
Modal.setAppElement("#root");

function App() {
  // State для вибору лікаря
  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    return localStorage.getItem("selectedDoctor") || null;
  });

  // State для табів
  const [activeTab, setActiveTab] = useState("personnel");
  const [showModal, setShowModal] = useState(false);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [operationType, setOperationType] = useState("income"); // 'personnel' or 'income'

  // Hooks для personnel
  const personnelBalance = useBalance("personnel");
  const personnelDays = useDays("personnel");

  // Hooks для operational
  const operationalBalance = useBalance("operational");
  const operationalDays = useDays("operational");

  // Вибираємо активні дані на основі табу
  const activeBalance =
    activeTab === "personnel" ? personnelBalance : operationalBalance;
  const activeDays =
    activeTab === "personnel" ? personnelDays : operationalDays;

  // Фільтруємо записи по вибраній даті для Personnel
  const filteredData = useMemo(() => {
    if (activeTab !== "personnel") return { entries: [], personnelAmount: 0 };

    // Знаходимо ВСІ дні з вибраною датою (може бути кілька документів)
    const daysForDate = personnelDays.days.filter((day) => {
      // Використовуємо dateString якщо є, інакше конвертуємо timestamp
      const dayDate =
        day.dateString ||
        (day.date?.toDate
          ? day.date.toDate().toISOString().split("T")[0]
          : new Date(day.date).toISOString().split("T")[0]);
      return dayDate === selectedDate;
    });

    // Об'єднуємо всі entries з усіх знайдених днів
    const allEntries = daysForDate.reduce((acc, day) => {
      return [...acc, ...(day.entries || [])];
    }, []);

    // Підсумовуємо personnel з усіх днів
    const totalPersonnel = daysForDate.reduce((sum, day) => {
      return sum + (day.personnel || 0);
    }, 0);

    return {
      entries: allEntries,
      personnelAmount: totalPersonnel,
    };
  }, [activeTab, personnelDays.days, selectedDate]);

  // Обчислення поточного балансу
  const currentBalance = useMemo(() => {
    let balance = activeBalance.initialBalance;

    activeDays.days.forEach((day) => {
      const dayTotal = day.entries?.reduce((sum, e) => sum + e.amount, 0) || 0;

      if (activeTab === "operational") {
        const withdrawalTotal =
          day.withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
        balance += dayTotal - withdrawalTotal;
      } else {
        balance += dayTotal;
      }

      if (day.personnel) {
        balance -= day.personnel;
      }
    });

    return balance;
  }, [activeBalance.initialBalance, activeDays.days, activeTab]);

  // Обробник вибору лікаря
  const handleDoctorSelect = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    localStorage.setItem("selectedDoctor", doctor);
  }, []);

  // Обробник виходу
  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Вийти з системи?",
      text: "Ви впевнені, що хочете вийти?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
      cancelButtonColor: SWAL_CONFIG.cancelButtonColor,
      confirmButtonText: "Так, вийти",
      cancelButtonText: "Скасувати",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedDoctor(null);
        localStorage.removeItem("selectedDoctor");
        Swal.fire({
          icon: "success",
          title: "До побачення!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }, []);

  // Обробники подій
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleOpenModal = useCallback((day = null, type = "income") => {
    setOperationType(type);

    // Якщо тип 'personnel' і немає day для редагування, відкриваємо PersonnelModal
    if (type === "personnel" && !day) {
      setShowPersonnelModal(true);
      return;
    }

    if (day) {
      setEditingDay({
        ...day,
        dateString: day.date?.toDate
          ? day.date.toDate().toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setEditingDay(null);
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingDay(null);
  }, []);

  const handleClosePersonnelModal = useCallback(() => {
    setShowPersonnelModal(false);
  }, []);

  const handleEditEntry = useCallback(
    async (entry, index) => {
      // Знаходимо всі дні з вибраною датою
      const daysForDate = personnelDays.days.filter((day) => {
        const dayDate =
          day.dateString ||
          (day.date?.toDate
            ? day.date.toDate().toISOString().split("T")[0]
            : new Date(day.date).toISOString().split("T")[0]);
        return dayDate === selectedDate;
      });

      // Знаходимо, в якому документі знаходиться цей запис
      let targetDay = null;
      let entryIndexInDay = -1;
      let globalIndex = 0;

      for (const day of daysForDate) {
        const dayEntries = day.entries || [];
        if (globalIndex + dayEntries.length > index) {
          targetDay = day;
          entryIndexInDay = index - globalIndex;
          break;
        }
        globalIndex += dayEntries.length;
      }

      if (!targetDay) return;

      // Показуємо prompt для редагування суми
      const result = await Swal.fire({
        title: "Редагувати запис",
        html: `
          <div style="
            text-align: left;
            padding: 20px 0;
            margin-bottom: 10px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              background: linear-gradient(135deg, #f0f4ff 0%, #e9e9ff 100%);
              border-radius: 12px;
              margin-bottom: 12px;
              border-left: 4px solid #667eea;
            ">
              <svg style="width: 24px; height: 24px; color: #667eea; flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <div style="flex: 1;">
                <div style="font-size: 12px; color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">ПІБ</div>
                <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${entry.name}</div>
              </div>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              border-radius: 12px;
              border-left: 4px solid #10b981;
            ">
              <svg style="width: 24px; height: 24px; color: #10b981; flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
              <div style="flex: 1;">
                <div style="font-size: 12px; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Поточна сума</div>
                <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${entry.amount} грн</div>
              </div>
            </div>
          </div>
        `,
        input: "number",
        inputLabel: "Нова сума",
        inputValue: entry.amount,
        showCancelButton: true,
        confirmButtonText: "Зберегти",
        cancelButtonText: "Скасувати",
        confirmButtonColor: "#667eea",
        cancelButtonColor: "#e2e8f0",
        customClass: {
          popup: "edit-entry-popup",
          title: "edit-entry-title",
          htmlContainer: "edit-entry-html",
          input: "edit-entry-input",
          confirmButton: "edit-entry-confirm-btn",
          cancelButton: "edit-entry-cancel-btn",
        },
        inputValidator: (value) => {
          if (!value || parseFloat(value) <= 0) {
            return "Введіть коректну суму!";
          }
        },
        didOpen: () => {
          const input = Swal.getInput();
          if (input) {
            input.style.cssText = `
              -moz-appearance: textfield;
              appearance: textfield;
            `;
            const style = document.createElement("style");
            style.textContent = `
              .swal2-input::-webkit-outer-spin-button,
              .swal2-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
              .edit-entry-popup {
                border-radius: 20px !important;
                padding: 32px !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
              }
              .edit-entry-title {
                font-size: 26px !important;
                font-weight: 700 !important;
                color: #1e293b !important;
                padding-bottom: 0 !important;
              }
              .edit-entry-html {
                margin: 0 !important;
                padding: 0 !important;
              }
              .swal2-input-label {
                font-size: 14px !important;
                font-weight: 600 !important;
                color: #475569 !important;
                margin-bottom: 8px !important;
                margin-top: 0 !important;
              }
              .edit-entry-input {
                border: 2px solid #e2e8f0 !important;
                border-radius: 12px !important;
                padding: 14px 16px !important;
                font-size: 16px !important;
                font-weight: 600 !important;
                transition: all 0.2s ease !important;
              }
              .edit-entry-input:focus {
                border-color: #667eea !important;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
              }
              .edit-entry-confirm-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border: none !important;
                border-radius: 12px !important;
                padding: 14px 28px !important;
                font-size: 15px !important;
                font-weight: 600 !important;
                color: white !important;
                transition: opacity 0.2s ease !important;
              }
              .edit-entry-confirm-btn:hover {
                opacity: 0.9 !important;
              }
              .edit-entry-cancel-btn {
                background: #e2e8f0 !important;
                color: #64748b !important;
                border: none !important;
                border-radius: 12px !important;
                padding: 14px 28px !important;
                font-size: 15px !important;
                font-weight: 600 !important;
                transition: background 0.2s ease !important;
              }
              .edit-entry-cancel-btn:hover {
                background: #cbd5e1 !important;
              }
              .swal2-actions {
                gap: 12px !important;
                margin-top: 24px !important;
              }
              .swal2-html-container > div {
                margin: 0 !important;
                padding: 15px 0!important;
              }
            `;
            document.head.appendChild(style);
          }
        },
      });

      if (result.isConfirmed) {
        const newAmount = parseFloat(result.value);
        const updatedEntries = [...targetDay.entries];
        updatedEntries[entryIndexInDay] = { ...entry, amount: newAmount };

        await personnelDays.updateDay(targetDay.id, {
          ...targetDay,
          entries: updatedEntries,
        });

        Swal.fire({
          icon: "success",
          title: "Запис оновлено",
          showConfirmButton: false,
          timer: 1500,
        });

        await Promise.all([
          personnelBalance.loadBalance(),
          personnelDays.loadDays(true),
        ]);
      }
    },
    [personnelDays, personnelBalance, selectedDate],
  );

  const handleDeleteEntry = useCallback(
    async (entry, index) => {
      const result = await Swal.fire({
        title: "Видалити запис?",
        html: `<p><strong>${entry.name}</strong><br/>${entry.amount} грн</p>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: SWAL_CONFIG.cancelButtonColor,
        confirmButtonText: "Так, видалити",
        cancelButtonText: "Скасувати",
      });

      if (result.isConfirmed) {
        // Знаходимо всі дні з вибраною датою
        const daysForDate = personnelDays.days.filter((day) => {
          const dayDate =
            day.dateString ||
            (day.date?.toDate
              ? day.date.toDate().toISOString().split("T")[0]
              : new Date(day.date).toISOString().split("T")[0]);
          return dayDate === selectedDate;
        });

        // Знаходимо, в якому документі знаходиться цей запис
        let targetDay = null;
        let entryIndexInDay = -1;
        let globalIndex = 0;

        for (const day of daysForDate) {
          const dayEntries = day.entries || [];
          if (globalIndex + dayEntries.length > index) {
            targetDay = day;
            entryIndexInDay = index - globalIndex;
            break;
          }
          globalIndex += dayEntries.length;
        }

        if (!targetDay) return;

        const updatedEntries = targetDay.entries.filter(
          (_, i) => i !== entryIndexInDay,
        );

        // Якщо це був останній запис, видаляємо весь документ
        if (updatedEntries.length === 0 && (targetDay.personnel || 0) === 0) {
          await personnelDays.deleteDay(targetDay.id);
        } else {
          await personnelDays.updateDay(targetDay.id, {
            ...targetDay,
            entries: updatedEntries,
          });
        }

        Swal.fire({
          icon: "success",
          title: "Запис видалено",
          showConfirmButton: false,
          timer: 1500,
        });

        await Promise.all([
          personnelBalance.loadBalance(),
          personnelDays.loadDays(true),
        ]);
      }
    },
    [personnelDays, personnelBalance, selectedDate],
  );

  const handleSavePersonnel = useCallback(
    async (dayData) => {
      try {
        await personnelDays.createDay(dayData);
        Swal.fire({
          icon: "success",
          title: "Суму персоналу додано",
          showConfirmButton: false,
          timer: 1500,
        });

        await personnelBalance.loadBalance();
        handleClosePersonnelModal();
      } catch (error) {
        console.error("Помилка збереження:", error);
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: "Не вдалося зберегти суму персоналу",
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
      }
    },
    [personnelDays, personnelBalance, handleClosePersonnelModal],
  );

  const handleSaveDay = useCallback(
    async (dayData) => {
      try {
        if (editingDay) {
          await activeDays.updateDay(editingDay.id, dayData);
          Swal.fire({
            icon: "success",
            title: MESSAGES.SUCCESS.UPDATE,
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          // Для режиму income перевіряємо, чи вже є день з такою датою
          const existingDay = activeDays.days.find((day) => {
            const dayDate =
              day.dateString ||
              (day.date?.toDate
                ? day.date.toDate().toISOString().split("T")[0]
                : new Date(day.date).toISOString().split("T")[0]);
            return dayDate === dayData.dateString;
          });

          if (existingDay) {
            // Якщо день існує, додаємо новий запис до існуючих
            const updatedDayData = {
              ...dayData,
              entries: [...(existingDay.entries || []), ...dayData.entries],
            };
            await activeDays.updateDay(existingDay.id, updatedDayData);
          } else {
            // Якщо дня немає, створюємо новий
            await activeDays.createDay(dayData);
          }

          Swal.fire({
            icon: "success",
            title: MESSAGES.SUCCESS.SAVE,
            showConfirmButton: false,
            timer: 1500,
          });
        }

        // Перезавантажуємо баланс та дні (await для уникнення race condition)
        await Promise.all([
          activeBalance.loadBalance(),
          activeDays.loadDays(true),
        ]);
        handleCloseModal();
      } catch (error) {
        console.error("Помилка збереження дня:", error);
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: editingDay ? MESSAGES.ERRORS.UPDATE : MESSAGES.ERRORS.SAVE,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
      }
    },
    [editingDay, activeDays, activeBalance, handleCloseModal],
  );

  // Якщо лікар не вибраний, показуємо екран вибору
  if (!selectedDoctor) {
    return <DoctorSelection onDoctorSelect={handleDoctorSelect} />;
  }

  // Loading state
  if (activeDays.loading) {
    return <LoadingState />;
  }

  // Error state
  if (activeDays.error && activeDays.days.length === 0) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h2>😔 Не вдалося завантажити дані</h2>
          <p>{activeDays.error}</p>
          <button
            className="btn btn-primary"
            onClick={() => activeDays.loadDays()}
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header doctorName={selectedDoctor} onLogout={handleLogout} />

      <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />

      <BalanceCards
        initialBalance={activeBalance.initialBalance}
        currentBalance={currentBalance}
        editingBalance={activeBalance.editingBalance}
        balanceInput={activeBalance.balanceInput}
        onBalanceInputChange={activeBalance.setBalanceInput}
        onStartEdit={activeBalance.startEdit}
        onSaveBalance={activeBalance.saveBalance}
        onCancelEdit={activeBalance.cancelEdit}
      />

      {/* Для Personnel показуємо контрол дати та таблицю */}
      {activeTab === "personnel" ? (
        <div className="personnel-section">
          <div className="date-selector">
            <div className="date-group">
              <label htmlFor="date-select">Оберіть дату:</label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="action-group">
              <button
                className="btn btn-secondary btn-add-personnel"
                onClick={() => handleOpenModal(null, "personnel")}
              >
                <AddIcon style={{ fontSize: "1.1em", marginRight: "6px" }} />
                Додати персоналу
              </button>
              <button
                className="btn btn-primary btn-add-income"
                onClick={() => handleOpenModal(null, "income")}
              >
                <AddIcon style={{ fontSize: "1.1em", marginRight: "6px" }} />
                Додати загальне
              </button>
            </div>
          </div>
          <EntriesTable
            entries={filteredData.entries}
            personnelAmount={filteredData.personnelAmount}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />
        </div>
      ) : (
        /* Для Operational показуємо картки як раніше */
        <div className="days-section">
          <button
            className="btn btn-primary btn-add-day"
            onClick={() => handleOpenModal()}
          >
            <AddIcon style={{ fontSize: "1.2em", marginRight: "8px" }} />
            Додати новий день
          </button>
          <h3 className="section-title">Всі записи</h3>
          {activeDays.days.length === 0 ? (
            <div className="empty-state">
              <p>Немає записів</p>
            </div>
          ) : (
            <div className="days-grid">
              {[...activeDays.days]
                .sort((a, b) => {
                  const dateA = a.date?.toDate
                    ? a.date.toDate()
                    : new Date(a.date);
                  const dateB = b.date?.toDate
                    ? b.date.toDate()
                    : new Date(b.date);
                  return dateB - dateA;
                })
                .map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    activeTab={activeTab}
                    onEdit={handleOpenModal}
                    onDelete={activeDays.deleteDay}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      <AddDayModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveDay}
        editingDay={editingDay}
        activeTab={activeTab}
        selectedDate={selectedDate}
        operationType={operationType}
        doctorName={selectedDoctor}
      />

      <PersonnelModal
        isOpen={showPersonnelModal}
        onClose={handleClosePersonnelModal}
        onSave={handleSavePersonnel}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default App;
