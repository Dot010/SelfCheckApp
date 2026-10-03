import { describe, expect, it } from "vitest";

import { formatCurrency } from "@/helpers/format-currency";

// Intl uses a non-breaking space between the symbol and the amount.
const normalize = (value: string) => value.replace(/\s/g, " ");

describe("formatCurrency", () => {
  it("formats cents as reais", () => {
    expect(normalize(formatCurrency(3990))).toBe("R$ 39,90");
    expect(normalize(formatCurrency(5))).toBe("R$ 0,05");
    expect(normalize(formatCurrency(123456))).toBe("R$ 1.234,56");
  });
});
