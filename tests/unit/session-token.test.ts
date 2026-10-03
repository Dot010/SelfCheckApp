import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signSession, verifySession } from "@/lib/session-token";

const session = { userId: "user-1", restaurantId: "rest-1", slug: "tigela" };

describe("admin session token", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a session", async () => {
    const token = await signSession(session);
    expect(await verifySession(token)).toEqual(session);
  });

  it("rejects missing, tampered and foreign tokens", async () => {
    const token = await signSession(session);
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession(`${token.slice(0, -2)}xx`)).toBeNull();

    vi.stubEnv("AUTH_SECRET", "b".repeat(32));
    expect(await verifySession(token)).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const expired = await new SignJWT({ restaurantId: "r", slug: "s" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("u")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode("a".repeat(32)));
    expect(await verifySession(expired)).toBeNull();
  });

  it("refuses to sign with a short secret", () => {
    vi.stubEnv("AUTH_SECRET", "short");
    expect(() => signSession(session)).toThrow(/AUTH_SECRET/);
  });
});
