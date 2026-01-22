import React from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import TuneIcon from "@mui/icons-material/Tune";
import "./DateFilters.css";

/**
 * Компонент фільтрів по датах
 * @param {string} dateFilter - Поточний фільтр
 * @param {string} customStartDate - Початкова дата (для custom)
 * @param {string} customEndDate - Кінцева дата (для custom)
 * @param {function} onFilterChange - Callback для зміни фільтра
 * @param {function} onCustomStartChange - Callback для зміни початкової дати
 * @param {function} onCustomEndChange - Callback для зміни кінцевої дати
 */
const DateFilters = ({
  dateFilter,
  customStartDate,
  customEndDate,
  onFilterChange,
  onCustomStartChange,
  onCustomEndChange,
}) => {
  const filters = [
    { value: "all", label: "Всі записи", icon: AllInclusiveIcon },
    { value: "week", label: "Цей тиждень", icon: DateRangeIcon },
    { value: "month", label: "Цей місяць", icon: CalendarTodayIcon },
    { value: "year", label: "Цей рік", icon: EventIcon },
    { value: "custom", label: "Вибрати період", icon: TuneIcon },
  ];

  return (
    <div className="filters-section">
      <div className="filters-header">
        <h4 className="filters-title">
          <FilterListIcon style={{ fontSize: "1.2em" }} />
          Фільтр по датах
        </h4>
        {dateFilter !== "all" && (
          <span className="filter-badge">
            {filters.find((f) => f.value === dateFilter)?.label}
          </span>
        )}
      </div>
      <div className="filters-grid">
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <button
              key={filter.value}
              className={`filter-btn ${dateFilter === filter.value ? "active" : ""}`}
              onClick={() => onFilterChange(filter.value)}
            >
              <IconComponent style={{ fontSize: "1.1em" }} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
      {dateFilter === "custom" && (
        <div className="custom-date-range">
          <div className="date-input-group">
            <label htmlFor="custom-start-date">Від:</label>
            <input
              id="custom-start-date"
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartChange(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="custom-end-date">До:</label>
            <input
              id="custom-end-date"
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilters;
