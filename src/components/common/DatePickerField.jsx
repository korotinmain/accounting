import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "react-datepicker/dist/react-datepicker.css";
import "../../assets/components/DatePicker.css";

// Реєструємо українську локаль
registerLocale("uk", uk);

/**
 * Уніфікований компонент для вибору дати
 * @param {string} label - Мітка поля
 * @param {Date} selected - Вибрана дата
 * @param {function} onChange - Callback для зміни дати
 * @param {string} id - ID для input елемента
 * @param {boolean} required - Чи обов'язкове поле
 */
const DatePickerField = ({
  label = "Дата",
  selected,
  onChange,
  id = "date-input",
  required = false,
}) => {
  return (
    <div className="form-input-wrapper">
      {label && (
        <label htmlFor={id} className="form-input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <div className="datepicker-container">
        <DatePicker
          id={id}
          selected={selected}
          onChange={(selectedDate) => onChange(selectedDate || new Date())}
          dateFormat="dd.MM.yyyy"
          locale="uk"
          wrapperClassName="datepicker-wrapper"
          calendarClassName="custom-calendar"
          showPopperArrow={false}
          portalId="root-portal"
        />
        <CalendarTodayIcon className="datepicker-icon" />
      </div>
    </div>
  );
};

export default DatePickerField;
