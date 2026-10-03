import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("verifies the right password only", async () => {
    const stored = await hashPassword("tigela123");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("tigela123", stored)).toBe(true);
    expect(await verifyPassword("tigela124", stored)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("x", "plain-text")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$a$b")).toBe(false);
  });
});
