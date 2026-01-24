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
