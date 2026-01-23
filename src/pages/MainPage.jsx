import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";

// Hooks
import { useBalance } from "../hooks/useBalance";
import { useDays } from "../hooks/useDays";

// Components
import Header from "../components/Header";
import TabSwitcher from "../components/TabSwitcher";
import MonthlyStats from "../components/MonthlyStats";
import DayCard from "../components/DayCard";
import EntryModal from "../components/EntryModal";
import PersonnelModal from "../components/PersonnelModal";
import LoadingState from "../components/LoadingState";
import EntriesTable from "../components/EntriesTable";
import StyledButton from "../components/StyledButton";

// Utils
import { SWAL_CONFIG, MESSAGES } from "../utils/constants";

/**
 * Головна сторінка додатку з управлінням фінансами
 * @param {string} selectedDoctor - Ім'я вибраного лікаря
 * @param {function} onLogout - Функція виходу з системи
 */
const MainPage = ({ selectedDoctor, onLogout }) => {
  const navigate = useNavigate();

  // State для табів
  const [activeTab, setActiveTab] = useState("personnel");
  const [showModal, setShowModal] = useState(false);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  // Фільтруємо записи по вибраному місяцю для Personnel
  const filteredData = useMemo(() => {
    if (activeTab !== "personnel")
      return { entries: [], personnelAmount: 0, days: [] };

    const selectedMonthValue = selectedMonth.getMonth();
    const selectedYear = selectedMonth.getFullYear();

    const daysForMonth = personnelDays.days.filter((day) => {
      const dayDate = day.dateString
        ? new Date(day.dateString)
        : day.date?.toDate
          ? day.date.toDate()
          : new Date(day.date);
      return (
        dayDate.getMonth() === selectedMonthValue &&
        dayDate.getFullYear() === selectedYear
      );
    });

    // Збираємо всі записи з інформацією про дату
    const allEntries = daysForMonth.reduce((acc, day) => {
      const dayDate = day.dateString
        ? new Date(day.dateString)
        : day.date?.toDate
          ? day.date.toDate()
          : new Date(day.date);

      const entriesWithDate = (day.entries || []).map((entry) => ({
        ...entry,
        date: dayDate,
        dayId: day.id,
      }));
      return [...acc, ...entriesWithDate];
    }, []);

    const totalPersonnel = daysForMonth.reduce((sum, day) => {
      return sum + (day.personnel || 0);
    }, 0);

    return {
      entries: allEntries,
      personnelAmount: totalPersonnel,
      days: daysForMonth,
    };
  }, [activeTab, personnelDays.days, selectedMonth]);

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
        balance -= day.personnel || 0;
        balance += dayTotal;
      }
    });

    return balance;
  }, [activeBalance.initialBalance, activeDays.days, activeTab]);

  // Обробник виходу
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  // Обробник відкриття налаштувань
  const handleOpenSettings = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  // Обробники подій
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleOpenModal = useCallback((entry = null) => {
    setEditingEntry(entry);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingEntry(null);
  }, []);

  const handleClosePersonnelModal = useCallback(() => {
    setShowPersonnelModal(false);
  }, []);

  const handleDeleteEntry = useCallback(
    async (entryId) => {
      const result = await Swal.fire({
        title: "Видалити запис?",
        text: "Цю дію неможливо скасувати",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        cancelButtonColor: SWAL_CONFIG.cancelButtonColor,
        confirmButtonText: "Так, видалити",
        cancelButtonText: "Скасувати",
      });

      if (!result.isConfirmed) return;

      try {
        const selectedMonthValue = selectedMonth.getMonth();
        const selectedYear = selectedMonth.getFullYear();

        const daysForMonth = personnelDays.days.filter((day) => {
          const dayDate = day.dateString
            ? new Date(day.dateString)
            : day.date?.toDate
              ? day.date.toDate()
              : new Date(day.date);
          return (
            dayDate.getMonth() === selectedMonthValue &&
            dayDate.getFullYear() === selectedYear
          );
        });

        for (const day of daysForMonth) {
          const entryToDelete = day.entries.find((e) => e.id === entryId);
          if (entryToDelete) {
            const updatedEntries = day.entries.filter((e) => e.id !== entryId);
            if (updatedEntries.length === 0 && !day.personnel) {
              await personnelDays.deleteDay(day.id);
            } else {
              await personnelDays.updateDay(day.id, {
                ...day,
                entries: updatedEntries,
              });
            }
            break;
          }
        }

        Swal.fire({
          icon: "success",
          title: MESSAGES.SUCCESS.DELETE,
          showConfirmButton: false,
          timer: 1500,
        });

        await Promise.all([
          personnelBalance.loadBalance(),
          personnelDays.loadDays(true),
        ]);
      } catch (error) {
        console.error("Помилка видалення запису:", error);
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: MESSAGES.ERRORS.DELETE,
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
      }
    },
    [personnelDays, personnelBalance, selectedMonth],
  );

  const handleEditEntry = useCallback(
    async (entryId) => {
      // Знаходимо запис в filteredData
      const entryToEdit = filteredData.entries.find((e) => e.id === entryId);

      if (!entryToEdit) {
        console.log("Entry not found in filteredData");
        return;
      }

      // Відкриваємо модалку з даними для редагування
      handleOpenModal(entryToEdit);
    },
    [filteredData.entries, handleOpenModal],
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

  const handleMonthChange = useCallback((newMonth) => {
    setSelectedMonth(newMonth);
  }, []);

  const handleSaveEntry = useCallback(
    async (entryData) => {
      try {
        // Якщо редагуємо існуючий entry
        if (entryData.id && entryData.dayId) {
          const day = personnelDays.days.find((d) => d.id === entryData.dayId);
          if (day) {
            const updatedEntries = day.entries.map((e) =>
              e.id === entryData.id
                ? { ...e, name: entryData.name, amount: entryData.amount }
                : e,
            );
            await personnelDays.updateDay(day.id, {
              ...day,
              entries: updatedEntries,
            });
          }
        } else {
          // Створюємо новий entry
          const existingDay = personnelDays.days.find((day) => {
            const dayDate =
              day.dateString ||
              (day.date?.toDate
                ? day.date.toDate().toISOString().split("T")[0]
                : new Date(day.date).toISOString().split("T")[0]);
            return dayDate === entryData.date;
          });

          if (existingDay) {
            // Додаємо entry до існуючого дня
            const updatedEntries = [
              ...(existingDay.entries || []),
              { name: entryData.name, amount: entryData.amount },
            ];
            await personnelDays.updateDay(existingDay.id, {
              ...existingDay,
              entries: updatedEntries,
            });
          } else {
            // Створюємо новий день з entry
            await personnelDays.createDay({
              dateString: entryData.date,
              entries: [{ name: entryData.name, amount: entryData.amount }],
              personnel: 0,
            });
          }
        }

        Swal.fire({
          icon: "success",
          title: entryData.id ? "Запис оновлено" : "Запис додано",
          showConfirmButton: false,
          timer: 1500,
        });

        await Promise.all([
          personnelBalance.loadBalance(),
          personnelDays.loadDays(true),
        ]);
      } catch (error) {
        console.error("Помилка збереження:", error);
        Swal.fire({
          icon: "error",
          title: "Помилка",
          text: "Не вдалося зберегти запис",
          confirmButtonColor: SWAL_CONFIG.confirmButtonColor,
        });
      }
    },
    [personnelDays, personnelBalance],
  );

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
      <Header
        doctorName={selectedDoctor}
        onLogout={handleLogout}
        onSettings={handleOpenSettings}
      />

      <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="stats-and-actions-container">
        <MonthlyStats
          days={activeDays.days}
          currentBalance={currentBalance}
          type={activeTab}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        {activeTab === "personnel" && (
          <div className="action-buttons-container">
            <StyledButton
              variant="secondary"
              size="medium"
              startIcon={<AddIcon />}
              onClick={() => setShowPersonnelModal(true)}
            >
              Додати персоналу
            </StyledButton>
            <StyledButton
              variant="primary"
              size="medium"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal(null)}
            >
              Додати загальне
            </StyledButton>
          </div>
        )}
      </div>

      {activeTab === "personnel" ? (
        <div className="personnel-section">
          <EntriesTable
            entries={filteredData.entries}
            personnelAmount={filteredData.personnelAmount}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />
        </div>
      ) : (
        <div className="days-section">
          <StyledButton
            variant="primary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Додати новий день
          </StyledButton>
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

      <EntryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        doctorName={selectedDoctor}
      />

      <PersonnelModal
        isOpen={showPersonnelModal}
        onClose={handleClosePersonnelModal}
        onSave={handleSavePersonnel}
        selectedDate={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
};

export default MainPage;
