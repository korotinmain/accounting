import {
  validateNumber,
  validateRequired,
  validateDate,
  sanitizeNumber,
} from "../validation";
import { VALIDATION } from "../constants";

describe("validation", () => {
  describe("validateNumber", () => {
    it("should return true for valid numbers", () => {
      expect(validateNumber(100)).toBe(true);
      expect(validateNumber(0)).toBe(true);
      expect(validateNumber(1000.5)).toBe(true);
    });

    it("should return false for invalid numbers", () => {
      expect(validateNumber("not a number")).toBe(false);
      expect(validateNumber(NaN)).toBe(false);
    });

    it("should return false for numbers outside valid range", () => {
      expect(validateNumber(-1)).toBe(false);
      expect(validateNumber(VALIDATION.MAX_AMOUNT + 1)).toBe(false);
    });

    it("should return true for numbers at the boundaries", () => {
      expect(validateNumber(VALIDATION.MIN_AMOUNT)).toBe(true);
      expect(validateNumber(VALIDATION.MAX_AMOUNT)).toBe(true);
    });
  });

  describe("validateRequired", () => {
    it("should return true for non-empty values", () => {
      expect(validateRequired("text")).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(0)).toBe(true);
    });

    it("should return false for empty values", () => {
      expect(validateRequired("")).toBe(false);
      expect(validateRequired("   ")).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe("validateDate", () => {
    it("should return true for valid dates", () => {
      expect(validateDate(new Date())).toBe(true);
      expect(validateDate("2024-01-15")).toBe(true);
      expect(validateDate("2024-12-31T10:30:00")).toBe(true);
    });

    it("should return false for invalid dates", () => {
      expect(validateDate("not a date")).toBe(false);
      expect(validateDate(null)).toBe(false);
      expect(validateDate(undefined)).toBe(false);
      expect(validateDate("")).toBe(false);
    });
  });

  describe("sanitizeNumber", () => {
    it("should return the number if it's within valid range", () => {
      expect(sanitizeNumber(100)).toBe(100);
      expect(sanitizeNumber(500.5)).toBe(500.5);
    });

    it("should return MIN_AMOUNT for numbers below minimum", () => {
      expect(sanitizeNumber(-100)).toBe(VALIDATION.MIN_AMOUNT);
      expect(sanitizeNumber(-1)).toBe(VALIDATION.MIN_AMOUNT);
    });

    it("should return MAX_AMOUNT for numbers above maximum", () => {
      expect(sanitizeNumber(VALIDATION.MAX_AMOUNT + 100)).toBe(
        VALIDATION.MAX_AMOUNT,
      );
    });

    it("should return 0 for invalid numbers", () => {
      expect(sanitizeNumber("not a number")).toBe(0);
      expect(sanitizeNumber(NaN)).toBe(0);
    });

    it("should handle edge cases", () => {
      expect(sanitizeNumber(VALIDATION.MIN_AMOUNT)).toBe(VALIDATION.MIN_AMOUNT);
      expect(sanitizeNumber(VALIDATION.MAX_AMOUNT)).toBe(VALIDATION.MAX_AMOUNT);
    });
  });
});
