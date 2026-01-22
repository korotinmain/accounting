/**
 * Утиліти для роботи з датами та фільтрами
 */

/**
 * Отримує початок тижня (понеділок)
 * @returns {Date}
 */
export const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Отримує початок місяця
 * @returns {Date}
 */
export const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Отримує початок року
 * @returns {Date}
 */
export const getStartOfYear = () => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
};

/**
 * Фільтрує дні за датою
 * @param {Array} days - Масив днів
 * @param {string} filterType - Тип фільтра ('all', 'week', 'month', 'year', 'custom')
 * @param {string} customStart - Початкова дата (для custom)
 * @param {string} customEnd - Кінцева дата (для custom)
 * @returns {Array} - Відфільтровані дні
 */
export const filterDaysByDate = (
  days,
  filterType,
  customStart = "",
  customEnd = "",
) => {
  if (filterType === "all") return days;

  const now = new Date();
  let startDate;

  switch (filterType) {
    case "week":
      startDate = getStartOfWeek();
      break;
    case "month":
      startDate = getStartOfMonth();
      break;
    case "year":
      startDate = getStartOfYear();
      break;
    case "custom":
      if (!customStart || !customEnd) return days;
      const customStartDate = new Date(customStart + "T00:00:00");
      const customEndDate = new Date(customEnd + "T23:59:59");
      return days.filter((day) => {
        const dayDate = day.date?.toDate
          ? day.date.toDate()
          : new Date(day.date);
        return dayDate >= customStartDate && dayDate <= customEndDate;
      });
    default:
      return days;
  }

  return days.filter((day) => {
    const dayDate = day.date?.toDate ? day.date.toDate() : new Date(day.date);
    return dayDate >= startDate && dayDate <= now;
  });
};

/**
 * Сортує дні від найновішого до найстарішого
 * @param {Array} days - Масив днів
 * @returns {Array} - Відсортовані дні
 */
export const sortDaysByDate = (days) => {
  return [...days].sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return dateB - dateA;
  });
};

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
