import { randomBytes } from "node:crypto";

/**
 * Generate a secure, human-readable access code.
 * Format: 6 uppercase alphanumeric characters.
 */
export function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}
