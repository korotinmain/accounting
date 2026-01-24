import { formatCurrency } from "../formatters";

describe("formatters", () => {
  describe("formatCurrency", () => {
    it("should format integer numbers with 2 decimal places", () => {
      const result = formatCurrency(1000);
      // Перевіряємо що результат містить число та формат з комою
      expect(result).toContain("1");
      expect(result).toContain("000");
      expect(result).toContain(",00");
    });

    it("should format decimal numbers correctly", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1");
      expect(result).toContain("234");
      expect(result).toContain(",56");
    });

    it("should format zero correctly", () => {
      expect(formatCurrency(0)).toBe("0,00");
    });

    it("should format negative numbers correctly", () => {
      const result = formatCurrency(-500.75);
      expect(result).toContain("-500");
      expect(result).toContain(",75");
    });

    it("should handle large numbers", () => {
      const result = formatCurrency(1234567.89);
      expect(result).toContain("1");
      expect(result).toContain("234");
      expect(result).toContain("567");
      expect(result).toContain(",89");
    });

    it("should round to 2 decimal places", () => {
      const result = formatCurrency(10.999);
      expect(result).toContain("11");
      expect(result).toContain(",00");
    });

    it("should handle very small numbers", () => {
      expect(formatCurrency(0.01)).toBe("0,01");
    });
  });
});
