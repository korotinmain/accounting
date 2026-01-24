import React, { useMemo } from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { formatCurrency } from "../utils/formatters";
import { Card } from "./common";
import "../assets/components/MonthlyStats.css";

/**
 * Компонент місячної статистики - показує дані за вибраний місяць
 * @param {Array} days - Масив днів
 * @param {number} currentBalance - Поточний баланс
 * @param {number} initialBalance - Початковий баланс
 * @param {string} type - Тип (personnel/operational)
 * @param {Date} selectedMonth - Вибраний місяць
 * @param {function} onMonthChange - Callback для зміни місяця
 */
const MonthlyStats = ({
  days,
  currentBalance,
  initialBalance = 0,
  type,
  selectedMonth,
  onMonthChange,
}) => {
  // Отримуємо статистику за вибраний місяць
  const monthStats = useMemo(() => {
    const selectedMonthValue = selectedMonth.getMonth();
    const selectedYear = selectedMonth.getFullYear();

    // Фільтруємо дні за вибраний місяць
    const monthDays = days.filter((day) => {
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

    // Підраховуємо доходи
    const totalIncome = monthDays.reduce((sum, day) => {
      const dayTotal = day.entries?.reduce((acc, e) => acc + e.amount, 0) || 0;
      return sum + dayTotal;
    }, 0);

    // Підраховуємо витрати
    let totalExpenses = 0;
    if (type === "personnel") {
      totalExpenses = monthDays.reduce((sum, day) => {
        const personnelTotal =
          day.personnelEntries?.reduce((acc, e) => acc + e.amount, 0) || 0;
        return sum + personnelTotal;
      }, 0);
    } else {
      totalExpenses = monthDays.reduce((sum, day) => {
        const withdrawalTotal =
          day.withdrawals?.reduce((acc, w) => acc + w.amount, 0) || 0;
        return sum + withdrawalTotal;
      }, 0);
    }

    const netProfit = totalIncome - totalExpenses;
    const daysCount = monthDays.length;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      daysCount,
    };
  }, [days, type, selectedMonth]);

  // Назва місяця
  const monthName = selectedMonth.toLocaleDateString("uk-UA", {
    month: "long",
    year: "numeric",
  });

  // Функції для навігації по місяцях
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  // Перевірка чи це поточний місяць
  const isCurrentMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const selectedMonthValue = selectedMonth.getMonth();
    const selectedYear = selectedMonth.getFullYear();

    return currentMonth === selectedMonthValue && currentYear === selectedYear;
  };

  return (
    <div className="monthly-stats-wrapper">
      {/* Поточний залишок */}
      <Card variant="elevated" className="current-balance-card">
        <div className="balance-display">
          <div className="balance-icon-large">
            <AttachMoneyIcon />
          </div>
          <div className="balance-info">
            <span className="balance-label">Поточний залишок</span>
            <div className="balance-amount-large">
              <span
                className={`balance-value-large ${currentBalance >= 0 ? "positive" : "negative"}`}
              >
                {formatCurrency(currentBalance)}
              </span>
              <span className="balance-currency-large">грн</span>
            </div>
            <div
              className={`balance-indicator ${currentBalance >= 0 ? "positive" : "negative"}`}
            >
              {currentBalance >= 0 ? "▲ Позитивний" : "▼ Негативний"}
            </div>
            <div className="balance-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Початковий баланс:</span>
                <span className="breakdown-value" style={{ color: "#6366f1" }}>
                  {formatCurrency(initialBalance)} грн
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Статистика за місяць */}
      <Card variant="elevated" className="monthly-stats-card main-stats">
        <div className="stats-header">
          <div className="stats-icon-wrapper">
            <CalendarMonthIcon />
          </div>
          <h3 className="stats-title">Статистика за місяць</h3>
        </div>

        <div className="month-selector-wrapper">
          <div className="month-selector">
            <button
              className="month-nav-btn"
              onClick={goToPreviousMonth}
              aria-label="Попередній місяць"
            >
              <ArrowBackIosIcon />
            </button>
            <span className="stats-subtitle">{monthName}</span>
            <button
              className="month-nav-btn"
              onClick={goToNextMonth}
              aria-label="Наступний місяць"
            >
              <ArrowForwardIosIcon />
            </button>
          </div>
          {!isCurrentMonth() && (
            <button className="current-month-btn" onClick={goToCurrentMonth}>
              Поточний місяць
            </button>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-item income-stat">
            <div className="stat-icon income">
              <TrendingUpIcon />
            </div>
            <div className="stat-content">
              <span className="stat-label">Доходи</span>
              <span className="stat-value positive">
                +{formatCurrency(monthStats.totalIncome)}
              </span>
              <span className="stat-currency">грн</span>
            </div>
          </div>

          <div className="stat-item expense-stat">
            <div className="stat-icon expense">
              <ReceiptIcon />
            </div>
            <div className="stat-content">
              <span className="stat-label">Витрати</span>
              <span className="stat-value negative">
                -{formatCurrency(monthStats.totalExpenses)}
              </span>
              <span className="stat-currency">грн</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyStats;
