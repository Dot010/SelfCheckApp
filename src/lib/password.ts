import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Passwords are hashed with scrypt (built into Node), stored as
// "scrypt$<salt>$<hash>" in base64. No extra dependency needed.

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
  const [algorithm, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(
    password,
    Buffer.from(salt, "base64"),
    expected.length,
  );
  // Constant-time comparison so response time doesn't leak how close a guess was.
  return timingSafeEqual(actual, expected);
};
