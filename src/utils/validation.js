import { VALIDATION } from "./constants";

export const validateNumber = (value) => {
  const num = parseFloat(value);
  return (
    !isNaN(num) && num >= VALIDATION.MIN_AMOUNT && num <= VALIDATION.MAX_AMOUNT
  );
};

export const validateRequired = (value) => {
  return (
    value !== null && value !== undefined && value.toString().trim() !== ""
  );
};

export const validateDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export const sanitizeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num)
    ? 0
    : Math.max(VALIDATION.MIN_AMOUNT, Math.min(VALIDATION.MAX_AMOUNT, num));
};
