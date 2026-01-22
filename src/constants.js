// Константи для застосунку

export const COLLECTIONS = {
  SETTINGS: "settings",
  DAYS: "days",
};

export const SWAL_CONFIG = {
  confirmButtonColor: "#6366f1",
  cancelButtonColor: "#94a3b8",
  dangerButtonColor: "#ef4444",
  timer: 2000,
};

export const VALIDATION = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,
  DATE_FORMAT: "dd.MM.yyyy",
};

export const MESSAGES = {
  ERRORS: {
    FIREBASE_NOT_INITIALIZED:
      "Помилка підключення до Firebase. Перевірте налаштування.",
    FIREBASE_CONNECTION: "Помилка підключення до бази даних",
    INVALID_NUMBER: "Введіть коректне число",
    INVALID_AMOUNT: "Введіть коректну суму",
    EMPTY_FIELDS: "Заповніть всі обов'язкові поля",
    EMPTY_NAME_AMOUNT: "Заповніть ПІБ та суму",
    NO_DATE: "Виберіть дату",
    NO_ENTRIES: "Додайте хоча б один запис",
    SAVE_BALANCE_ERROR: "Помилка збереження балансу",
    SAVE_DAY_ERROR: "Помилка збереження дня",
    DELETE_DAY_ERROR: "Помилка видалення дня",
  },
  SUCCESS: {
    BALANCE_SAVED: "Баланс успішно оновлено",
    DAY_SAVED: "День збережено успішно!",
    DAY_DELETED: "День успішно видалено",
    DELETE: "День успішно видалено",
  },
  CONFIRM: {
    DELETE_TITLE: "Ви впевнені?",
    DELETE_TEXT: "Цей день буде видалено назавжди!",
    DELETE_DAY: "Цей день буде видалено назавжди!",
  },
};
