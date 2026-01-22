import { useState, useCallback } from "react";
import { filterDaysByDate, sortDaysByDate } from "../utils/dateUtils";

/**
 * Custom hook для управління фільтрами дат
 * @param {Array} days - Масив днів для фільтрації
 * @returns {Object} - Стан та методи для роботи з фільтрами
 */
export const useDateFilters = (days = []) => {
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  /**
   * Отримує відфільтровані та відсортовані дні
   */
  const filteredDays = useCallback(() => {
    const filtered = filterDaysByDate(
      days,
      dateFilter,
      customStartDate,
      customEndDate,
    );
    return sortDaysByDate(filtered);
  }, [days, dateFilter, customStartDate, customEndDate]);

  /**
   * Змінює тип фільтра
   */
  const changeFilter = useCallback((filterType) => {
    setDateFilter(filterType);
  }, []);

  /**
   * Встановлює кастомний діапазон дат
   */
  const setCustomRange = useCallback((startDate, endDate) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  }, []);

  /**
   * Скидає фільтри до початкового стану
   */
  const resetFilters = useCallback(() => {
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  }, []);

  return {
    dateFilter,
    customStartDate,
    customEndDate,
    filteredDays: filteredDays(),
    changeFilter,
    setCustomStartDate,
    setCustomEndDate,
    setCustomRange,
    resetFilters,
  };
};
