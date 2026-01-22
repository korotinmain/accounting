import React, { useState, useCallback, useMemo } from "react";
import "./App.css";
import Modal from "react-modal";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";

// Hooks
import { useBalance } from "./hooks/useBalance";
import { useDays } from "./hooks/useDays";
import { useDateFilters } from "./hooks/useDateFilters";

// Components
import Header from "./components/Header";
import TabSwitcher from "./components/TabSwitcher";
import BalanceCards from "./components/BalanceCards";
import DateFilters from "./components/DateFilters";
import DayCard from "./components/DayCard";
import AddDayModal from "./components/AddDayModal";
import LoadingState from "./components/LoadingState";

// Utils
import { SWAL_CONFIG, MESSAGES } from "./constants";

// Встановлюю root для accessibility
Modal.setAppElement("#root");

function App() {
  // State для табів
  const [activeTab, setActiveTab] = useState("personnel");
  const [showModal, setShowModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);

  // Hooks для personnel
  const personnelBalance = useBalance("personnel");
  const personnelDays = useDays("personnel");
  const personnelFilters = useDateFilters(personnelDays.days);

  // Hooks для operational
  const operationalBalance = useBalance("operational");
  const operationalDays = useDays("operational");
  const operationalFilters = useDateFilters(operationalDays.days);

  // Вибираємо активні дані на основі табу
  const activeBalance =
    activeTab === "personnel" ? personnelBalance : operationalBalance;
  const activeDays =
    activeTab === "personnel" ? personnelDays : operationalDays;
  const activeFilters =
    activeTab === "personnel" ? personnelFilters : operationalFilters;

  // Обчислення поточного балансу
  const currentBalance = useMemo(() => {
    let balance = activeBalance.initialBalance;

    activeFilters.filteredDays.forEach((day) => {
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
  }, [activeBalance.initialBalance, activeFilters.filteredDays, activeTab]);

  // Обробники подій
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleOpenModal = useCallback((day = null) => {
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
          await activeDays.createDay(dayData);
          Swal.fire({
            icon: "success",
            title: MESSAGES.SUCCESS.SAVE,
            showConfirmButton: false,
            timer: 1500,
          });
        }

        // Перезавантажуємо баланс
        activeBalance.loadBalance();
        handleCloseModal();
      } catch (error) {
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
      <Header />

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

      <button
        className="btn btn-primary btn-add-day"
        onClick={() => handleOpenModal()}
      >
        <AddIcon style={{ fontSize: "1.2em", marginRight: "8px" }} />
        Додати новий день
      </button>

      <DateFilters
        dateFilter={activeFilters.dateFilter}
        customStartDate={activeFilters.customStartDate}
        customEndDate={activeFilters.customEndDate}
        onFilterChange={activeFilters.changeFilter}
        onCustomStartChange={activeFilters.setCustomStartDate}
        onCustomEndChange={activeFilters.setCustomEndDate}
      />

      <div className="days-section">
        <h3 className="section-title">Записи за період</h3>
        {activeFilters.filteredDays.length === 0 ? (
          <div className="empty-state">
            <p>Немає записів за вибраний період</p>
            <button
              className="btn btn-secondary"
              onClick={() => activeFilters.resetFilters()}
            >
              Скинути фільтри
            </button>
          </div>
        ) : (
          <div className="days-grid">
            {activeFilters.filteredDays.map((day) => (
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

      <AddDayModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveDay}
        editingDay={editingDay}
        activeTab={activeTab}
      />
    </div>
  );
}

export default App;
