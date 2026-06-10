import { randomInt } from "node:crypto";

/**
 * Generate a secure, human-readable access code.
 * Format: 6 uppercase alphanumeric characters.
 */
export function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(chars.length)];
  }

  return code;
}
