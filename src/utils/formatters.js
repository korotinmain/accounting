/**
 * Утиліти для форматування даних
 */

/**
 * Форматує число як валюту в українському форматі
 * @param {number} amount - Сума для форматування
 * @returns {string} - Відформатована сума
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Форматує дату в український формат (ДД.ММ.РРРР)
 * @param {Date|Timestamp} date - Дата для форматування
 * @returns {string} - Відформатована дата
 */
export const formatDate = (date) => {
  const dateObj = date?.toDate ? date.toDate() : new Date(date);
  return dateObj.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Форматує назву дня тижня українською
 * @param {Date|Timestamp} date - Дата
 * @returns {string} - Назва дня тижня
 */
export const formatDayOfWeek = (date) => {
  const dateObj = date?.toDate ? date.toDate() : new Date(date);
  return dateObj.toLocaleDateString("uk-UA", { weekday: "long" });
};

/**
 * Парсить рядок дати в Date об'єкт
 * @param {string} dateString - Рядок дати (YYYY-MM-DD)
 * @returns {Date} - Date об'єкт
 */
export const parseDate = (dateString) => {
  return new Date(dateString + "T00:00:00");
};
