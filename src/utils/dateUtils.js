/**
 * Утиліти для роботи з датами
 */

/**
 * Отримує сьогоднішню дату в форматі YYYY-MM-DD
 * @returns {string}
 */
export const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Парсить рядок дати в Date об'єкт
 * @param {string} dateString - Рядок дати (YYYY-MM-DD)
 * @returns {Date} - Date об'єкт
 */
export const parseDate = (dateString) => {
  return new Date(dateString + "T00:00:00");
};
