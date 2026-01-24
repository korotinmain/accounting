import { parseDate } from "../dateUtils";

describe("dateUtils", () => {
  describe("parseDate", () => {
    it("should parse date string to Date object", () => {
      const dateString = "2024-01-15";
      const result = parseDate(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it("should handle different date formats", () => {
      const dateString = "2026-12-31";
      const result = parseDate(dateString);

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(11); // December is 11
      expect(result.getDate()).toBe(31);
    });

    it("should set time to midnight", () => {
      const dateString = "2024-06-15";
      const result = parseDate(dateString);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });
});
