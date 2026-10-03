import { describe, expect, it } from "vitest";

import {
  generateCpf,
  isValidCpf,
  removeCpfPunctuation,
} from "@/app/[slug]/menu/helpers/cpf";

describe("isValidCpf", () => {
  it("accepts valid numbers with or without punctuation", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("11144477735")).toBe(true);
  });

  it("rejects wrong check digits", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.444.777-53")).toBe(false);
  });

  it("rejects repeated digits and wrong lengths", () => {
    expect(isValidCpf("000.000.000-00")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });
});

describe("removeCpfPunctuation", () => {
  it("keeps only the digits", () => {
    expect(removeCpfPunctuation("529.982.247-25")).toBe("52998224725");
  });
});

describe("generateCpf", () => {
  it("creates valid, formatted numbers", () => {
    for (let i = 0; i < 200; i++) {
      const cpf = generateCpf();
      expect(cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      expect(isValidCpf(cpf)).toBe(true);
    }
  });
});
