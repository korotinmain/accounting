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
import BalanceCards from "../components/BalanceCards";
import DayCard from "../components/DayCard";
import AddDayModal from "../components/AddDayModal";
import PersonnelModal from "../components/PersonnelModal";
import LoadingState from "../components/LoadingState";
import EntriesTable from "../components/EntriesTable";
import StyledButton from "../components/StyledButton";

// Utils
import { SWAL_CONFIG, MESSAGES } from "../constants";

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
  const [editingDay, setEditingDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [operationType, setOperationType] = useState("income");

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

    const daysForDate = personnelDays.days.filter((day) => {
      const dayDate =
        day.dateString ||
        (day.date?.toDate
          ? day.date.toDate().toISOString().split("T")[0]
          : new Date(day.date).toISOString().split("T")[0]);
      return dayDate === selectedDate;
    });

    const allEntries = daysForDate.reduce((acc, day) => {
      return [...acc, ...(day.entries || [])];
    }, []);

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

  const handleOpenModal = useCallback((day = null, type = "income") => {
    setOperationType(type);

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
        const daysForDate = personnelDays.days.filter((day) => {
          const dayDate =
            day.dateString ||
            (day.date?.toDate
              ? day.date.toDate().toISOString().split("T")[0]
              : new Date(day.date).toISOString().split("T")[0]);
          return dayDate === selectedDate;
        });

        for (const day of daysForDate) {
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
    [personnelDays, personnelBalance, selectedDate],
  );

  const handleEditEntry = useCallback(
    async (entryId) => {
      const daysForDate = personnelDays.days.filter((day) => {
        const dayDate =
          day.dateString ||
          (day.date?.toDate
            ? day.date.toDate().toISOString().split("T")[0]
            : new Date(day.date).toISOString().split("T")[0]);
        return dayDate === selectedDate;
      });

      for (const day of daysForDate) {
        const entry = day.entries.find((e) => e.id === entryId);
        if (entry) {
          handleOpenModal(
            {
              ...day,
              entries: [entry],
            },
            "income",
          );
          break;
        }
      }
    },
    [personnelDays, selectedDate, handleOpenModal],
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
          const existingDay = activeDays.days.find((day) => {
            const dayDate =
              day.dateString ||
              (day.date?.toDate
                ? day.date.toDate().toISOString().split("T")[0]
                : new Date(day.date).toISOString().split("T")[0]);
            return dayDate === dayData.dateString;
          });

          if (existingDay) {
            const updatedDayData = {
              ...dayData,
              entries: [...(existingDay.entries || []), ...dayData.entries],
            };
            await activeDays.updateDay(existingDay.id, updatedDayData);
          } else {
            await activeDays.createDay(dayData);
          }

          Swal.fire({
            icon: "success",
            title: MESSAGES.SUCCESS.SAVE,
            showConfirmButton: false,
            timer: 1500,
          });
        }

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
              <StyledButton
                variant="secondary"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal(null, "personnel")}
              >
                Додати персоналу
              </StyledButton>
              <StyledButton
                variant="primary"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal(null, "income")}
              >
                Додати загальне
              </StyledButton>
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
};

export default MainPage;
