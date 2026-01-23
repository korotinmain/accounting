import React, { useMemo } from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { formatCurrency } from "../utils/formatters";
import { Card } from "./common";
import "../assets/components/MonthlyStats.css";

/**
 * Компонент місячної статистики - показує дані за поточний місяць
 * @param {Array} days - Масив днів
 * @param {number} currentBalance - Поточний баланс
 * @param {string} type - Тип (personnel/operational)
 */
const MonthlyStats = ({ days, currentBalance, type }) => {
  // Отримуємо статистику за поточний місяць
  const monthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Фільтруємо дні за поточний місяць
    const monthDays = days.filter((day) => {
      const dayDate = day.dateString
        ? new Date(day.dateString)
        : day.date?.toDate
          ? day.date.toDate()
          : new Date(day.date);

      return (
        dayDate.getMonth() === currentMonth &&
        dayDate.getFullYear() === currentYear
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
        return sum + (day.personnel || 0);
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
  }, [days, type]);

  // Назва місяця
  const monthName = new Date().toLocaleDateString("uk-UA", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="monthly-stats-wrapper">
      {/* Статистика за місяць */}
      <Card variant="elevated" className="monthly-stats-card main-stats">
        <div className="stats-header">
          <div className="stats-icon-wrapper">
            <CalendarMonthIcon />
          </div>
          <div className="stats-title-group">
            <h3 className="stats-title">Статистика за місяць</h3>
            <p className="stats-subtitle">{monthName}</p>
          </div>
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

          <div className="stat-item days-stat">
            <div className="stat-icon neutral">
              <CalendarMonthIcon />
            </div>
            <div className="stat-content">
              <span className="stat-label">Днів додано</span>
              <span className="stat-value days-count">
                {monthStats.daysCount}
              </span>
            </div>
          </div>

          <div className="stat-item profit-stat">
            <div className="stat-icon profit">
              <AttachMoneyIcon />
            </div>
            <div className="stat-content">
              <span className="stat-label">Чистий прибуток</span>
              <span
                className={`stat-value ${monthStats.netProfit >= 0 ? "positive" : "negative"}`}
              >
                {monthStats.netProfit >= 0 ? "+" : ""}
                {formatCurrency(monthStats.netProfit)}
              </span>
              <span className="stat-currency">грн</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Поточний баланс */}
      <Card variant="elevated" className="monthly-stats-card balance-card">
        <div className="balance-header">
          <div className="balance-icon-wrapper">
            <TrendingUpIcon />
          </div>
          <span className="balance-title">Поточний залишок</span>
        </div>
        <div className="balance-amount-display">
          <span className="balance-value">
            {formatCurrency(currentBalance)}
          </span>
          <span className="balance-currency-label">грн</span>
        </div>
        <div
          className={`balance-status ${currentBalance >= 0 ? "positive" : "negative"}`}
        >
          <AttachMoneyIcon />
          <span>
            {currentBalance >= 0 ? "Позитивний баланс" : "Негативний баланс"}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyStats;
