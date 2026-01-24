/**
 * Утиліти для роботи з датами
 */

/**
 * Парсить рядок дати в Date об'єкт
 * @param {string} dateString - Рядок дати (YYYY-MM-DD)
 * @returns {Date} - Date об'єкт
 */
export const parseDate = (dateString) => {
  return new Date(dateString + "T00:00:00");
};
