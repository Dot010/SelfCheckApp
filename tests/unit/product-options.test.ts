import { describe, expect, it } from "vitest";

import {
  defaultOptionIds,
  resolveSelectedOptions,
} from "@/helpers/product-options";

const groups = [
  {
    id: "size",
    name: "Tamanho",
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: "300", name: "300 ml", price: 0, isDefault: false },
      { id: "500", name: "500 ml", price: 600, isDefault: true },
    ],
  },
  {
    id: "toppings",
    name: "Complementos",
    minSelect: 0,
    maxSelect: 2,
    options: [
      { id: "granola", name: "Granola", price: 0, isDefault: true },
      { id: "morango", name: "Morango", price: 300, isDefault: false },
      { id: "kiwi", name: "Kiwi", price: 350, isDefault: false },
    ],
  },
];

describe("resolveSelectedOptions", () => {
  it("prices a valid selection", () => {
    const result = resolveSelectedOptions(groups, ["500", "morango", "kiwi"]);
    expect(result).toEqual({
      ok: true,
      options: [
        expect.objectContaining({ id: "500" }),
        expect.objectContaining({ id: "morango" }),
        expect.objectContaining({ id: "kiwi" }),
      ],
      extraPrice: 1250,
    });
  });

  it("requires the minimum of a group", () => {
    const result = resolveSelectedOptions(groups, ["granola"]);
    expect(result).toEqual({
      ok: false,
      error: "Escolha uma opção em tamanho.",
    });
  });

  it("enforces the maximum of a group", () => {
    const result = resolveSelectedOptions(groups, [
      "300",
      "granola",
      "morango",
      "kiwi",
    ]);
    expect(result).toEqual({
      ok: false,
      error: "Escolha no máximo 2 em complementos.",
    });
  });

  it("rejects ids from other products and repeated ids", () => {
    expect(resolveSelectedOptions(groups, ["300", "bacon"]).ok).toBe(false);
    expect(resolveSelectedOptions(groups, ["300", "kiwi", "kiwi"]).ok).toBe(
      false,
    );
  });

  it("allows products without options", () => {
    expect(resolveSelectedOptions([], [])).toEqual({
      ok: true,
      options: [],
      extraPrice: 0,
    });
  });
});

describe("defaultOptionIds", () => {
  it("returns the pre-selected options", () => {
    expect(defaultOptionIds(groups)).toEqual(["500", "granola"]);
  });
});
